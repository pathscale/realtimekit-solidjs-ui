import type { RTKSelf } from '@cloudflare/realtimekit';

export interface MeetingLike {
  self: RTKSelf;
  leaveRoom?: () => void;

  stage?: {
    status?: string;
    addListener?: (event: string, handler: (...args: any[]) => void) => void;
    removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  };

  connectedMeetings?: {
    supportsConnectedMeetings?: boolean;
    isActive?: boolean;
    parentMeeting?: { id: string };
    meetings?: { id: string }[];
    moveParticipants?: (
      fromMeetingId: string,
      toMeetingId: string,
      participantIds: string[]
    ) => void;
  };

  participants?: {
    kickAll?: () => void;
  };

  meta?: {
    meetingId?: string;
    viewType?: string;
    [key: string]: any;
  };
}
