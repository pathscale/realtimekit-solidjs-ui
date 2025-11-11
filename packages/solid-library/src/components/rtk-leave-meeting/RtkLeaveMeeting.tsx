import { createSignal, createEffect, onCleanup, Show } from 'solid-js';
import { Modal, Button } from '@pathscale/ui';
import type { MeetingLike } from '~/types/rtk';

export interface RtkLeaveMeetingProps {
  meeting?: MeetingLike;
  open: boolean;
  onClose: () => void;
  onLeave?: () => void;
  onEndAll?: () => void;
  canEndMeeting?: boolean;
  canJoinMainRoom?: boolean;
  onJoinMainRoom?: () => void;
  title?: string;
  message?: string;
}

export default function RtkLeaveMeeting(props: RtkLeaveMeetingProps) {
  const [canEndMeeting, setCanEndMeeting] = createSignal(false);
  const [canJoinMainRoom, setCanJoinMainRoom] = createSignal(false);

  createEffect(() => {
    const meeting = props.meeting;
    if (!meeting || !meeting.self) return;

    const updatePermissions = () => {
      const perms = meeting.self.permissions;
      setCanEndMeeting(!!perms?.kickParticipant);
      setCanJoinMainRoom(!!perms?.connectedMeetings?.canSwitchToParentMeeting);
    };

    updatePermissions();

    meeting.self.permissions.addListener('permissionsUpdate', updatePermissions);

    onCleanup(() => {
      meeting.self.permissions.removeListener('permissionsUpdate', updatePermissions);
    });
  });

  const {
    open,
    onClose,
    onLeave,
    onEndAll,
    onJoinMainRoom,
    title = 'Leave Meeting',
    message = 'Are you sure you want to leave this meeting?',
  } = props;

  return (
    <Modal
      open={open}
      onClose={onClose}
      backdrop
      closeOnEsc
      closeOnOutsideClick
      size="md"
      position="middle"
      responsive
    >
      <Modal.Header>
        <h2 class="text-base-content text-lg font-semibold">{title}</h2>
      </Modal.Header>

      <Modal.Body class="text-base-content space-y-3">
        <p class="opacity-80">{message}</p>
      </Modal.Body>

      <Modal.Actions class="mt-4 flex flex-wrap justify-end gap-2">
        <Button variant="outline" color="neutral" onClick={onClose} class="">
          Cancel
        </Button>

        <Show when={canJoinMainRoom()}>
          <Button
            variant="soft"
            color="primary"
            onClick={onJoinMainRoom}
            class="bg-base-200 hover:bg-base-100"
          >
            Return to Main Room
          </Button>
        </Show>

        <Button variant="filled" color="error" onClick={onLeave}>
          Leave
        </Button>

        <Show when={canEndMeeting()}>
          <Button variant="filled" color="error" onClick={onEndAll} class=" opacity-90">
            End for All
          </Button>
        </Show>
      </Modal.Actions>
    </Modal>
  );
}
