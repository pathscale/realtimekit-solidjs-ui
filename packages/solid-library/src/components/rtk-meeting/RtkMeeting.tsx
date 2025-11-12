import { createSignal, createEffect, Show } from 'solid-js';
import { Card, Flex, Button } from '@pathscale/ui';
import RtkControlbar from '../rtk-controlbar/RtkControlbar';
import RtkMicToggle from '../rtk-mic-toggle/RtkMicToggle';
import RtkCameraToggle from '../rtk-camera-toggle/RtkCameraToggle';
import RtkLeaveButton from '../rtk-leave-button/RtkLeaveButton';
import RtkLeaveMeeting from '../rtk-leave-meeting/RtkLeaveMeeting';

export type MeetingMode = 'fixed' | 'fill';
export type MeetingState = 'setup' | 'joined' | 'ended';

export interface RtkMeetingProps {
  meeting?: any;
  initialState?: MeetingState;
  mode?: MeetingMode;
  onStateChange?: (state: MeetingState) => void;
}

export default function RtkMeeting(props: RtkMeetingProps) {
  const [meetingState, setMeetingState] = createSignal<MeetingState>(props.initialState ?? 'setup');
  const [mode] = createSignal<MeetingMode>(props.mode ?? 'fixed');
  const [showLeaveModal, setShowLeaveModal] = createSignal(false);

  createEffect(() => props.onStateChange?.(meetingState()));

  const handleJoin = async () => {
    setMeetingState('joined');
  };

  const handleLeave = () => {
    setShowLeaveModal(true);
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    setMeetingState('ended');
  };

  const handleCancelLeave = () => setShowLeaveModal(false);

  return (
    <Card
      fullWidth
      shadow="md"
      background="base-200"
      class="flex min-h-[70vh] w-full flex-col items-center justify-center gap-4 p-6"
    >
      <Show when={meetingState() === 'setup'}>
        <Flex direction="col" align="center" gap="md">
          <h2 class="text-lg font-semibold">Setup your meeting</h2>
          <p class="opacity-75">Click below to join the meeting.</p>
          <Button color="primary" onClick={handleJoin}>
            Join Meeting
          </Button>
        </Flex>
      </Show>

      <Show when={meetingState() === 'joined'}>
        <Flex direction="col" align="center" gap="md" class="w-full">
          <h2 class="text-lg font-semibold">Meeting active</h2>
          <p class="opacity-75">Mode: {mode()}</p>

          <div class="bg-base-300 flex h-64 w-full items-center justify-center rounded-lg">
            <p class="opacity-70">Stage area (RtkStage / RtkGrid placeholder)</p>
          </div>

          <RtkControlbar variant="boxed" size="md" class="mt-4 w-full justify-center">
            <RtkMicToggle meeting={props.meeting} />
            <RtkCameraToggle meeting={props.meeting} />
            <RtkLeaveButton
              onStateUpdate={(s) => s.activeLeaveConfirmation && setShowLeaveModal(true)}
              onLeave={handleLeave}
            />
          </RtkControlbar>
        </Flex>

        <RtkLeaveMeeting
          open={showLeaveModal()}
          onClose={handleCancelLeave}
          onLeave={handleConfirmLeave}
        />
      </Show>

      <Show when={meetingState() === 'ended'}>
        <Flex direction="col" align="center" gap="md">
          <h2 class="text-error text-lg font-semibold">Meeting ended</h2>
          <Button color="primary" onClick={() => setMeetingState('setup')}>
            Restart
          </Button>
        </Flex>
      </Show>
    </Card>
  );
}
