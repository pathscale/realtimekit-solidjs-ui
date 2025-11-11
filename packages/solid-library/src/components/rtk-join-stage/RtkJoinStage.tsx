import { createSignal, Show, splitProps } from 'solid-js';
import { Modal, Button, Flex, Loading } from '@pathscale/ui';
import RtkParticipantSetup from '../rtk-participant-setup';
import type { RTKSelf } from '@cloudflare/realtimekit';

export interface RtkJoinStageProps {
  open: boolean;
  participant?: RTKSelf;
  onJoin: () => Promise<void> | void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  class?: string;
}

export default function RtkJoinStage(allProps: RtkJoinStageProps) {
  const [props] = splitProps(allProps, [
    'open',
    'participant',
    'onJoin',
    'onCancel',
    'title',
    'description',
    'confirmLabel',
    'cancelLabel',
    'size',
    'class',
  ]);

  const [isLoading, setIsLoading] = createSignal(false);

  const handleJoin = async () => {
    if (isLoading()) return;
    setIsLoading(true);
    try {
      await props.onJoin?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={props.open}
      onClose={props.onCancel}
      backdrop
      size={props.size ?? 'md'}
      class={props.class}
    >
      <Modal.Header>
        <h3 class="text-lg font-semibold">{props.title ?? 'Join Stage'}</h3>
      </Modal.Header>

      <Modal.Body class="space-y-4">
        <p class="text-base-content">
          {props.description ??
            `You're about to join the stage. Your microphone and camera may become visible to others.`}
        </p>

        <Show when={props.participant}>
          <RtkParticipantSetup
            participant={props.participant!}
            isPreview
            class="h-48 w-full"
            nameTagPosition="bottom-left"
          />
        </Show>
      </Modal.Body>

      <Modal.Actions class="justify-end">
        <Button variant="outline" color="neutral" onClick={props.onCancel} disabled={isLoading()}>
          {props.cancelLabel ?? 'Cancel'}
        </Button>

        <Button variant="filled" color="primary" onClick={handleJoin} disabled={isLoading()}>
          <Show when={isLoading()} fallback={props.confirmLabel ?? 'Join Stage'}>
            <Flex align="center" gap="sm">
              <Loading size="sm" />
              <span>Joining...</span>
            </Flex>
          </Show>
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
