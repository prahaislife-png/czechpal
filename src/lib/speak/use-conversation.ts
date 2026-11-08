import { setAudioModeAsync } from 'expo-audio';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { announce } from '@/lib/a11y';
import { speak, stopSpeaking } from '@/lib/learn/voice';
import { useSpeak } from '@/store/speak';
import { useStore } from '@/store/cases';

import { SpeakError, speakApi } from './api';
import { eventsFromReview, nextGoal, speakingLevel, wordStates, wordsToRevisit, type SessionRecord } from './evidence';
import type { Cues, SpeakRequest, SpeakReview, SpeakSituation, Turn } from './types';
import { gptLive } from './voice/gpt-live';
import { VoiceError, type VoiceProvider } from './voice/provider';

/**
 * One Speak Czech conversation: voice through the provider seam, typing as the fallback, then a
 * short review that becomes evidence on the phone. Everything that costs money (voice time) is
 * ended here on every way out: the End button, the time limit, long silence, leaving the app,
 * a lost connection, and closing the screen.
 */

export type Phase = 'intro' | 'connecting' | 'live' | 'typed' | 'lost' | 'reviewing' | 'review';

/** After this much learner silence the partner gently checks in (once per question). */
const CHECK_IN_AFTER_S = 25;
/** After this much silence the session ends, so quiet time isn't spent. */
const QUIET_END_S = 90;
/** The partner counts as finished speaking after this long without new words. */
const PARTNER_DONE_MS = 1500;

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** `czechVoice`: the device's Czech voice, if it has one, to read typed replies aloud. */
export function useConversation(situation: SpeakSituation, czechVoice?: string | null) {
  const language = useStore((s) => s.language);
  const meaningOn = useSpeak((s) => s.meaningOn);
  const events = useSpeak((s) => s.events);
  const hidden = useSpeak((s) => s.hidden);

  // What the partner is told about the learner, fixed when the conversation opens.
  const request = useMemo<SpeakRequest>(() => {
    const level = speakingLevel(events);
    const words = wordsToRevisit(wordStates(events.filter((e) => e.kind !== 'word' || !hidden.includes(e.lemma))));
    return { situation, level, words, goal: nextGoal(events, level), language };
    // Only at the start: evidence saved at the end mustn't change this conversation's pitch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [situation]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [meanings, setMeanings] = useState<Record<string, string | null>>({});
  const [muted, setMutedState] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [limit, setLimit] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [partnerSpeaking, setPartnerSpeaking] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [review, setReview] = useState<SpeakReview | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const input = useSharedValue(0);
  const output = useSharedValue(0);

  const provider = useRef<VoiceProvider | null>(null);
  const sessionId = useRef<string | null>(null);
  const cues = useRef<Cues | null>(null);
  const startedAt = useRef(0);
  const voiceSeconds = useRef(0);
  const usedTyping = useRef(false);
  const lastSound = useRef(0);
  const lastPartner = useRef(0);
  const checkedIn = useRef(false);
  const helpPending = useRef(false);
  const meaningRef = useRef(meaningOn);
  const turnsRef = useRef<Turn[]>([]);
  const recordId = useRef(newId());
  const phaseRef = useRef<Phase>('intro');
  const live = useRef(false);

  useEffect(() => {
    meaningRef.current = meaningOn;
  }, [meaningOn]);
  const setTurnsBoth = useCallback((update: (t: Turn[]) => Turn[]) => {
    setTurns((t) => {
      const next = update(t);
      turnsRef.current = next;
      return next;
    });
  }, []);
  const go = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const addDelta = useCallback(
    (speaker: Turn['role'], delta: string) => {
      setTurnsBoth((ts) => {
        const last = ts[ts.length - 1];
        if (last && last.role === speaker) return [...ts.slice(0, -1), { ...last, text: last.text + delta }];
        const turn: Turn = { id: newId(), role: speaker, text: delta.trimStart() };
        if (speaker === 'learner') {
          if (meaningRef.current) turn.meaning = true;
          if (helpPending.current) turn.helped = true;
          helpPending.current = false;
        }
        return [...ts, turn];
      });
    },
    [setTurnsBoth],
  );

  /** Ends the voice session everywhere: provider, server (which counts the time), audio mode. */
  const stopVoice = useCallback(async (reason: string) => {
    const wasLive = live.current;
    live.current = false;
    if (startedAt.current) voiceSeconds.current += Math.round((Date.now() - startedAt.current) / 1000);
    startedAt.current = 0;
    provider.current?.close();
    provider.current = null;
    input.value = 0;
    output.value = 0;
    setPartnerSpeaking(false);
    setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    const id = sessionId.current;
    sessionId.current = null;
    if (id) await speakApi.end(id, reason).catch(() => {}); // The server's sweep ends it anyway.
    return wasLive;
  }, [input, output]);

  const startVoice = useCallback(async () => {
    if (phaseRef.current === 'connecting' || live.current) return;
    setError(null);
    setNotice(null);
    stopSpeaking();
    go('connecting');
    checkedIn.current = false;
    const voice = gptLive({
      onEvent: (e) => {
        if (e.type === 'transcript') {
          lastSound.current = Date.now();
          if (e.speaker === 'partner') {
            lastPartner.current = Date.now();
            checkedIn.current = false;
            setPartnerSpeaking(true);
          }
          addDelta(e.speaker, e.delta);
        } else if (e.type === 'closed' && live.current) {
          void finishVoice('closed', 'The conversation ended.');
        }
      },
      onLevels: (i, o) => {
        input.value = i;
        output.value = o;
        if (i > 0.08 || o > 0.08) lastSound.current = Date.now();
      },
      onLost: (message) => {
        if (!live.current) return;
        void stopVoice('lost').then(() => {
          setError({ message });
          go('lost');
        });
      },
    });
    provider.current = voice;
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true, shouldRouteThroughEarpiece: false }).catch(() => {});
      await voice.connect(async (offer) => {
        const started = await speakApi.start(request, offer, turnsRef.current);
        sessionId.current = started.id;
        cues.current = started.cues;
        setLimit(started.limitSeconds);
        return started.sdp;
      });
      if (provider.current !== voice) return; // Closed while connecting.
      // WebRTC may have reset the audio route while starting; ask for the speaker again.
      setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true, shouldRouteThroughEarpiece: false }).catch(() => {});
      live.current = true;
      startedAt.current = Date.now();
      lastSound.current = Date.now();
      setElapsed(0);
      go('live');
      voice.cue(cues.current!.greeting);
      announce('Connected. CzechPal is speaking.');
    } catch (e) {
      provider.current = null;
      await stopVoice('failed');
      const code = e instanceof SpeakError || e instanceof VoiceError ? e.code : 'connection';
      setError({ message: e instanceof Error ? e.message : 'The voice connection couldn’t start.', code });
      go(turnsRef.current.length ? 'lost' : 'intro');
    }
    // finishVoice is declared below and stable; listing it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addDelta, request, stopVoice, input, output]);

  /** Voice ended (limit, silence, background, provider): keep the conversation and review it. */
  const finishVoice = useCallback(
    async (reason: string, message: string) => {
      if (!live.current) return;
      await stopVoice(reason);
      setNotice(message);
      announce(message);
      void runReview();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stopVoice],
  );

  // The clock: time limit, check-in after silence, ending a quiet session.
  useEffect(() => {
    if (phase !== 'live') return;
    const timer = setInterval(() => {
      const now = Date.now();
      const secs = Math.floor((now - startedAt.current) / 1000);
      setElapsed(secs);
      if (now - lastPartner.current > PARTNER_DONE_MS) setPartnerSpeaking(false);
      if (limit && secs >= limit) {
        void finishVoice('time limit', 'That’s the end of this conversation’s time.');
        return;
      }
      const quiet = (now - lastSound.current) / 1000;
      if (quiet >= QUIET_END_S) void finishVoice('quiet', 'The conversation ended after a long quiet, to save your speaking time.');
      else if (quiet >= CHECK_IN_AFTER_S && !checkedIn.current && cues.current) {
        checkedIn.current = true;
        provider.current?.cue(cues.current.checkIn);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, limit, finishVoice]);

  // Leaving the app ends the voice session: no microphone, and no cost, in the background.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' && live.current) void finishVoice('background', 'The conversation ended when you left the app. Here’s your feedback.');
    });
    return () => sub.remove();
  }, [finishVoice]);

  // Closing the screen ends everything.
  useEffect(
    () => () => {
      if (live.current || sessionId.current) void stopVoice('closed screen');
      stopSpeaking();
    },
    [stopVoice],
  );

  // The meaning of each finished partner line, when meaning is on.
  // Lines asked for, so each is translated once (a failed one may be asked for again).
  const asked = useRef(new Set<string>());
  useEffect(() => {
    if (!meaningOn) return;
    const pending = turns.filter((t, i) => t.role === 'partner' && t.text.trim() && !asked.current.has(t.id) && (i < turns.length - 1 || !partnerSpeaking));
    for (const t of pending.slice(-2)) {
      asked.current.add(t.id);
      speakApi
        .meaning(t.text, language)
        .then((r) => setMeanings((m) => ({ ...m, [t.id]: r.meaning })))
        .catch(() => asked.current.delete(t.id));
    }
  }, [turns, meaningOn, partnerSpeaking, language]);

  const setMuted = (value: boolean) => {
    setMutedState(value);
    provider.current?.setMuted(value);
    announce(value ? 'Microphone off' : 'Microphone on');
    if (!value) lastSound.current = Date.now();
  };

  const help = () => {
    if (phaseRef.current === 'live' && cues.current) {
      helpPending.current = true;
      lastSound.current = Date.now();
      provider.current?.cue(cues.current.help);
    }
  };

  /** Switch to typing: voice ends (no time is spent while typing), the conversation carries on. */
  const typeInstead = async () => {
    usedTyping.current = true;
    if (live.current) await stopVoice('typing');
    setError(null);
    go('typed');
    if (!turnsRef.current.length) await partnerReply();
  };

  const partnerReply = async () => {
    setWaiting(true);
    try {
      const { reply } = await speakApi.reply(request, turnsRef.current);
      setTurnsBoth((t) => [...t, { id: newId(), role: 'partner', text: reply }]);
      if (czechVoice !== null) speak(reply, { voice: czechVoice, rate: 0.9 });
      announce(reply);
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'That didn’t come through. Try again.' });
    } finally {
      setWaiting(false);
    }
  };

  const sendTyped = async (text: string) => {
    const clean = text.trim();
    if (!clean || waiting) return false;
    setError(null);
    setTurnsBoth((t) => [...t, { id: newId(), role: 'learner', text: clean, typed: true, meaning: meaningRef.current || undefined }]);
    await partnerReply();
    return true;
  };

  async function runReview() {
    stopSpeaking();
    const finalTurns = turnsRef.current.map((t) => ({ ...t, text: t.text.trim() })).filter((t) => t.text);
    const learnerTurns = finalTurns.filter((t) => t.role === 'learner');
    const record: SessionRecord = {
      id: recordId.current,
      at: new Date().toISOString(),
      situation,
      seconds: voiceSeconds.current,
      mode: voiceSeconds.current && usedTyping.current ? 'mixed' : voiceSeconds.current ? 'voice' : 'typed',
      learnerTurns: learnerTurns.length,
      independentTurns: 0,
      helpUsed: learnerTurns.filter((t) => t.helped || t.meaning || t.typed).length,
      level: request.level,
    };
    if (!learnerTurns.length) {
      if (finalTurns.length) useSpeak.getState().saveSession(record, []);
      setReview(null);
      go('review');
      return;
    }
    go('reviewing');
    setReviewError(null);
    try {
      const r = await speakApi.review(situation, finalTurns, language);
      const at = new Date().toISOString();
      useSpeak.getState().saveSession(
        { ...record, independentTurns: r.independentTurns, helpUsed: r.helpUsed, summary: r.summary, wentWell: r.wentWell, corrections: r.corrections },
        eventsFromReview(r, record.id, at, situation),
      );
      setReview(r);
    } catch (e) {
      useSpeak.getState().saveSession(record, []);
      setReviewError(e instanceof Error ? e.message : 'Feedback didn’t come through.');
    }
    go('review');
  }

  /** The End button. */
  const end = async () => {
    if (live.current) await stopVoice('ended');
    await runReview();
  };

  return {
    request,
    phase,
    turns,
    meanings,
    muted,
    notice,
    error,
    limit,
    elapsed,
    partnerSpeaking,
    waiting,
    review,
    reviewError,
    levels: { input, output },
    startVoice,
    setMuted,
    help,
    typeInstead,
    sendTyped,
    end,
    retryReview: runReview,
  };
}
