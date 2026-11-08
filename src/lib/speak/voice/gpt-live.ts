import { VoiceError, type VoiceHandlers, type VoiceProvider } from './provider';
import { rtc } from './rtc';
import type { Channel, Peer, Stream } from './rtc-types';

/**
 * OpenAI GPT-Live over WebRTC. The app makes the offer; CzechLocal's server exchanges it with the
 * provider (the key never reaches the phone) and returns the answer. Events arrive on the
 * "oai-events" data channel. Lifecycle after Mural's LiveTransport (MIT, github.com/Chuloo/mural).
 */

/** How long to wait for the provider to say it has started. */
const READY_TIMEOUT_MS = 20_000;
/** Candidates gathered by then go in the offer; the provider's side is public, so that's enough. */
const GATHER_TIMEOUT_MS = 2_000;
/** A dropped connection gets this long to come back before the session counts as lost. */
const RECOVERY_MS = 6_000;

const id = () => `cz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function gptLive(handlers: VoiceHandlers): VoiceProvider {
  let peer: Peer | null = null;
  let channel: Channel | null = null;
  let mic: Stream | null = null;
  let stopRemote: (() => void) | null = null;
  let meter: ReturnType<typeof setInterval> | null = null;
  let recovery: ReturnType<typeof setTimeout> | null = null;
  let started = false;
  let closing = false;
  let muted = false;
  let levels = { input: 0, output: 0 };

  const send = (event: Record<string, unknown>) => {
    if (!channel || channel.readyState !== 'open') return false;
    try {
      channel.send(JSON.stringify({ event_id: id(), ...event }));
      return true;
    } catch {
      return false;
    }
  };

  const lost = (message: string) => {
    if (closing) return;
    closing = true;
    teardown();
    handlers.onLost(message);
  };

  const teardown = () => {
    if (meter) clearInterval(meter);
    if (recovery) clearTimeout(recovery);
    meter = recovery = null;
    mic?.getTracks().forEach((t) => t.stop());
    mic = null;
    try {
      channel?.close();
    } catch {}
    try {
      peer?.close();
    } catch {}
    stopRemote?.();
    channel = peer = null;
    stopRemote = null;
    handlers.onLevels(0, 0);
  };

  const onMessage = (raw: unknown) => {
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(String(raw));
    } catch {
      return;
    }
    switch (event.type) {
      case 'session.started':
        started = true;
        handlers.onEvent({ type: 'ready' });
        break;
      case 'session.input_transcript.delta':
      case 'session.output_transcript.delta':
        if (typeof event.delta === 'string' && event.delta)
          handlers.onEvent({ type: 'transcript', speaker: event.type === 'session.input_transcript.delta' ? 'learner' : 'partner', delta: event.delta });
        break;
      case 'session.closed':
        if (!closing) {
          closing = true;
          teardown();
          handlers.onEvent({ type: 'closed', reason: typeof event.reason === 'string' ? event.reason : undefined });
        }
        break;
      case 'error':
        handlers.onEvent({ type: 'rejected' });
        break;
    }
  };

  /** Audio levels from WebRTC's own statistics; smooth so the orb breathes rather than flickers. */
  const startMeter = () => {
    meter = setInterval(async () => {
      if (!peer) return;
      try {
        let input = 0;
        let output = 0;
        (await peer.getStats()).forEach((s) => {
          const level = typeof s.audioLevel === 'number' ? s.audioLevel : 0;
          if (s.type === 'inbound-rtp' && (s.kind === 'audio' || s.mediaType === 'audio')) output = Math.max(output, level);
          if (s.type === 'media-source' && s.kind === 'audio') input = Math.max(input, level);
        });
        levels = {
          input: levels.input * 0.4 + Math.min(1, input * 4) * 0.6,
          output: levels.output * 0.4 + Math.min(1, output * 4) * 0.6,
        };
        handlers.onLevels(muted ? 0 : levels.input, levels.output);
      } catch {
        // Statistics are a nicety; the conversation doesn't depend on them.
      }
    }, 120);
  };

  return {
    async connect(exchange) {
      closing = false;
      try {
        mic = await rtc.microphone();
      } catch {
        throw new VoiceError('microphone', 'CzechLocal can’t use the microphone. Allow it in Settings, or type your answers.');
      }
      try {
        peer = rtc.createPeer();
        stopRemote = rtc.playRemote(peer);
        for (const track of mic.getAudioTracks()) peer.addTrack(track, mic);
        channel = peer.createDataChannel('oai-events', { ordered: true });
        channel.addEventListener('message', (e: { data: unknown }) => onMessage(e.data));
        channel.addEventListener('close', () => {
          if (!closing) lost('The connection ended unexpectedly. Your conversation so far is kept.');
        });
        peer.addEventListener('iceconnectionstatechange', () => {
          const state = peer?.iceConnectionState;
          if (state === 'failed') lost('The connection was lost. Your conversation so far is kept.');
          else if (state === 'disconnected' && !recovery) {
            recovery = setTimeout(() => {
              recovery = null;
              if (peer?.iceConnectionState === 'disconnected') lost('The connection was lost. Your conversation so far is kept.');
            }, RECOVERY_MS);
          } else if ((state === 'connected' || state === 'completed') && recovery) {
            clearTimeout(recovery);
            recovery = null;
          }
        });

        const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
        await peer.setLocalDescription(offer);
        const deadline = Date.now() + GATHER_TIMEOUT_MS;
        while (peer && peer.iceGatheringState !== 'complete' && Date.now() < deadline) await new Promise((r) => setTimeout(r, 100));
        if (!peer?.localDescription?.sdp) throw new Error('no offer');
        const answer = await exchange(peer.localDescription.sdp);
        if (closing || !peer) throw new VoiceError('cancelled', 'Cancelled.');
        await peer.setRemoteDescription(rtc.answer(answer));

        const readyBy = Date.now() + READY_TIMEOUT_MS;
        while (!started && !closing && Date.now() < readyBy) await new Promise((r) => setTimeout(r, 100));
        if (closing) throw new VoiceError('cancelled', 'Cancelled.');
        if (!started) throw new VoiceError('timeout', 'The voice connection took too long. Try again, or type your answers.');
        startMeter();
      } catch (e) {
        closing = true;
        teardown();
        if (e instanceof VoiceError) throw e;
        // Server errors arrive already worded for the learner.
        if (e instanceof Error && e.name === 'SpeakError') throw e;
        throw new VoiceError('connection', 'The voice connection couldn’t start. Check your internet, or type your answers.');
      }
    },

    // Commentary, not instructions: GPT-Live says commentary aloud (in its own words), while an
    // instructions append only shapes later behaviour and doesn't make it speak. Checked live:
    // the greeting arrives about half a second after the cue.
    cue(text) {
      return started && send({ type: 'session.commentary.append', delegation_id: null, content: text.slice(0, 1000) });
    },

    setMuted(value) {
      muted = value;
      mic?.getAudioTracks().forEach((t) => (t.enabled = !value));
      send({ type: value ? 'session.input_audio.mute' : 'session.input_audio.unmute' });
    },

    close() {
      if (closing && !peer) return;
      const wasStarted = started;
      closing = true;
      mic?.getAudioTracks().forEach((t) => (t.enabled = false));
      if (wasStarted) send({ type: 'session.close' });
      // Give the close a moment to leave before the connection goes.
      setTimeout(teardown, wasStarted ? 400 : 0);
    },
  };
}
