import type { Rtc } from './rtc-types';

/** WebRTC in the browser: the same API, plus an audio element to play the partner. */
export const rtc: Rtc = {
  createPeer: () => new RTCPeerConnection() as unknown as ReturnType<Rtc['createPeer']>,
  microphone: async () => (await navigator.mediaDevices.getUserMedia({ audio: true })) as unknown as Awaited<ReturnType<Rtc['microphone']>>,
  answer: (sdp) => ({ type: 'answer', sdp }),
  playRemote: (peer) => {
    const audio = new Audio();
    audio.autoplay = true;
    peer.addEventListener('track', (e: { streams?: MediaStream[] }) => {
      if (e.streams?.[0]) audio.srcObject = e.streams[0];
    });
    return () => {
      audio.pause();
      audio.srcObject = null;
    };
  },
};
