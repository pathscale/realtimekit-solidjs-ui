import { createSignal, createEffect, onCleanup, Show, onMount } from 'solid-js';
import { Modal, Button } from '@pathscale/ui';
import type { MeetingLike } from '~/types/rtk';

export interface RtkLeaveMeetingProps {
  meeting?: MeetingLike;
  open: boolean;
  onClose: () => void;
  onLeave?: () => void;
  onEndAll?: () => void;
  onJoinMainRoom?: () => void;
  t?: (key: string) => string;
}

export default function RtkLeaveMeeting(props: RtkLeaveMeetingProps) {
  const [canEndMeeting, setCanEndMeeting] = createSignal(false);
  const [canJoinMainRoom, setCanJoinMainRoom] = createSignal(false);

  const t = props.t ?? ((key: string) => key);

  createEffect(() => {
    const meeting = props.meeting;
    if (!meeting?.self) return;

    const updatePermissions = () => {
      const perms = meeting.self?.permissions;
      setCanEndMeeting(!!perms?.kickParticipant);
      setCanJoinMainRoom(!!perms?.connectedMeetings?.canSwitchToParentMeeting);
    };

    updatePermissions();
    meeting.self?.addListener?.('permissionsUpdate', updatePermissions);
    onCleanup(() => meeting.self?.removeListener?.('permissionsUpdate', updatePermissions));
  });

  onMount(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && props.onClose?.();
    document.addEventListener('keydown', handleKey);
    onCleanup(() => document.removeEventListener('keydown', handleKey));
  });

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      backdrop
      closeOnEsc
      closeOnOutsideClick
      size="md"
      position="middle"
      responsive
    >
      <Modal.Header>
        <h2 class="text-lg font-semibold">{t('leave')}</h2>
      </Modal.Header>

      <Modal.Body class="text-base-content space-y-3">
        <p class="opacity-80">{t('leave_confirmation')}</p>
      </Modal.Body>

      <Modal.Actions class="mt-4 flex flex-wrap justify-end gap-2">
        <Button variant="outline" color="neutral" onClick={props.onClose}>
          {t('cancel')}
        </Button>

        <Show when={canJoinMainRoom()}>
          <Button
            variant="soft"
            color="primary"
            onClick={props.onJoinMainRoom}
            class="bg-base-200 hover:bg-base-100"
          >
            {t('breakout_rooms.leave_confirmation.main_room_btn')}
          </Button>
        </Show>

        <Button variant="filled" color="error" onClick={props.onLeave}>
          {t('leave')}
        </Button>

        <Show when={canEndMeeting()}>
          <Button variant="filled" color="error" onClick={props.onEndAll} class="opacity-90">
            {t('end.all')}
          </Button>
        </Show>
      </Modal.Actions>
    </Modal>
  );
}
