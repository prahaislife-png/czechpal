/**
 * The small part of WebRTC Speak Czech uses, the same on react-native-webrtc and in the browser.
 * Typed loosely on purpose: the two libraries' event types differ, the calls don't.
 */

export type Channel = {
  readyState: string;
  send(data: string): void;
  close(): void;
  addEventListener(type: 'open' | 'close' | 'message' | 'error', fn: (e: any) => void): void;
};

export type Track = { enabled: boolean; stop(): void };
export type Stream = { getTracks(): Track[]; getAudioTracks(): Track[] };

export type Peer = {
  localDescription: { sdp: string } | null;
  iceGatheringState: string;
  connectionState: string;
  iceConnectionState: string;
  createDataChannel(label: string, init?: { ordered?: boolean }): Channel;
  addTrack(track: Track, stream: Stream): unknown;
  createOffer(options?: unknown): Promise<{ type: string; sdp?: string }>;
  setLocalDescription(description: unknown): Promise<void>;
  setRemoteDescription(description: unknown): Promise<void>;
  getStats(): Promise<{ forEach(fn: (stat: any) => void): void }>;
  addEventListener(type: string, fn: (e: any) => void): void;
  close(): void;
};

export type Rtc = {
  createPeer(): Peer;
  microphone(): Promise<Stream>;
  answer(sdp: string): unknown;
  /** Plays the partner's audio where the platform doesn't do it by itself; returns a cleanup. */
  playRemote(peer: Peer): () => void;
};
