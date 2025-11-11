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

export interface SelfLike extends PeerLike {
  roomState?: string;
  isPinned?: boolean;
  permissions?: Record<string, any>;
}

export interface MeetingLike {
  self?: SelfLike;
  participants?: ParticipantsLike;
  stage?: {
    status?: string;
    addListener?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  };
  leave?: () => void;
}
