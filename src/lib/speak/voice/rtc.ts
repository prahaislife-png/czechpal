import { mediaDevices, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';

import type { Rtc } from './rtc-types';

/** WebRTC on iPhone and Android (react-native-webrtc). Remote audio plays by itself. */
export const rtc: Rtc = {
  createPeer: () => new RTCPeerConnection({}) as unknown as ReturnType<Rtc['createPeer']>,
  microphone: async () => (await mediaDevices.getUserMedia({ audio: true, video: false })) as unknown as Awaited<ReturnType<Rtc['microphone']>>,
  answer: (sdp) => new RTCSessionDescription({ type: 'answer', sdp }),
  playRemote: () => () => {},
};
