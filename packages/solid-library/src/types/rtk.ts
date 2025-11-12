export interface PeerLike {
  id?: string;
  name?: string;
  videoEnabled?: boolean;
  audioEnabled?: boolean;
  screenShareEnabled?: boolean;
  registerVideoElement?: (el: HTMLVideoElement) => void;
  registerAudioElement?: (el: HTMLAudioElement) => void;
  addListener?: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
}

export interface ParticipantCollectionLike {
  toArray?: () => PeerLike[];
  addListener?: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
}

export interface ParticipantsLike {
  active?: ParticipantCollectionLike;
  pinned?: ParticipantCollectionLike;
  joined?: ParticipantCollectionLike;
  addListener?: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
}

export interface SelfLike {
  id?: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  roomState?: 'joined' | 'left' | 'ended' | string;
  permissions?: {
    audio?: string;
    video?: string;
    canProduceAudio?: string;
    canProduceVideo?: string;
    isRecorder?: boolean;
    hiddenParticipant?: boolean;
    kickParticipant?: boolean;
    connectedMeetings?: {
      canSwitchToParentMeeting?: boolean;
    };
  };
  enableAudio?: () => Promise<void> | void;
  disableAudio?: () => Promise<void> | void;
  enableVideo?: () => Promise<void> | void;
  disableVideo?: () => Promise<void> | void;
  addListener?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
}
export interface MeetingLike {
  self?: SelfLike;
  stage?: { status?: string; addListener?: Function; removeListener?: Function };
  participants?: any;
  meta?: { viewType?: string };
  connectedMeetings?: {
    supportsConnectedMeetings?: boolean;
    canSwitchToParentMeeting?: boolean;
  };
}
