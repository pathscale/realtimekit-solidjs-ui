import { createSignal, createEffect, onCleanup, Show } from 'solid-js';
import type { MeetingLike } from '~/types/rtk';
import RtkControlbarButton from '../rtk-controlbar-button/RtkControlbarButton';
export interface RtkMicToggleProps {
  meeting?: MeetingLike;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'horizontal';
  t?: (key: string) => string;
  onStateUpdate?: (state: any) => void;
}

export default function RtkMicToggle(props: RtkMicToggleProps) {
  const [audioEnabled, setAudioEnabled] = createSignal(false);
  const [canProduceAudio, setCanProduceAudio] = createSignal(false);
  const [micPermission, setMicPermission] = createSignal('NOT_REQUESTED');
  const [stageStatus, setStageStatus] = createSignal('OFF_STAGE');

  const t = props.t ?? ((k: string) => k);

  createEffect(() => {
    const m = props.meeting;
    if (!m || !m.self) return;

    setAudioEnabled(m.self.audioEnabled ?? false);
    setCanProduceAudio(m.self.permissions?.canProduceAudio === 'ALLOWED');
    setMicPermission(m.self.permissions?.audio ?? 'NOT_REQUESTED');
    setStageStatus(m.stage?.status ?? 'OFF_STAGE');

    const onAudioUpdate = ({ audioEnabled }: any) => setAudioEnabled(audioEnabled);
    const onPermissionUpdate = ({ kind, message }: any) =>
      kind === 'audio' && setMicPermission(message);
    const onStageUpdate = () => setStageStatus(m.stage?.status ?? 'OFF_STAGE');

    m.self?.addListener?.('audioUpdate', onAudioUpdate);
    m.self?.addListener?.('mediaPermissionUpdate', onPermissionUpdate);
    m.stage?.addListener?.('stageStatusUpdate', onStageUpdate);

    onCleanup(() => {
      m.self?.removeListener?.('audioUpdate', onAudioUpdate);
      m.self?.removeListener?.('mediaPermissionUpdate', onPermissionUpdate);
      m.stage?.removeListener?.('stageStatusUpdate', onStageUpdate);
    });
  });

  const hasPermissionError = () => ['DENIED', 'SYSTEM_DENIED'].includes(micPermission());

  const toggleMic = () => {
    const m = props.meeting;
    if (!m || !canProduceAudio()) return;

    if (hasPermissionError()) {
      props.onStateUpdate?.({
        activePermissionsMessage: { enabled: true, kind: 'audio' },
      });
      return;
    }

    const self = m.self;
    if (self?.audioEnabled) self?.disableAudio?.();
    else self?.enableAudio?.();
  };

  const hidden =
    !canProduceAudio() || ['OFF_STAGE', 'REQUESTED_TO_JOIN_STAGE'].includes(stageStatus());

  const label = () => (audioEnabled() && !hasPermissionError() ? t('mic_on') : t('mic_off'));

  return (
    <Show when={!hidden}>
      <RtkControlbarButton
        size={props.size}
        label={label()}
        variant={props.variant}
        class={hasPermissionError() ? 'red-icon' : ''}
        showWarning={hasPermissionError()}
        onClick={toggleMic}
      />
    </Show>
  );
}
