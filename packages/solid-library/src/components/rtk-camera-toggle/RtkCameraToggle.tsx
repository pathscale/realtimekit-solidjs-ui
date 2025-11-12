import { createSignal, createEffect, onCleanup, Show } from 'solid-js';
import RtkControlbarButton from '../rtk-controlbar-button/RtkControlbarButton';
import type { MeetingLike } from '~/types/rtk';

export interface RtkCameraToggleProps {
  meeting?: MeetingLike;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'horizontal';
  t?: (key: string) => string;
  onStateUpdate?: (state: any) => void;
}

export default function RtkCameraToggle(props: RtkCameraToggleProps) {
  const [videoEnabled, setVideoEnabled] = createSignal(false);
  const [canProduceVideo, setCanProduceVideo] = createSignal(false);
  const [stageStatus, setStageStatus] = createSignal('OFF_STAGE');
  const [videoPermission, setVideoPermission] = createSignal('NOT_REQUESTED');

  const t = props.t ?? ((key: string) => key);

  createEffect(() => {
    const m = props.meeting;
    if (!m || !m.self) return;

    const self = m.self;
    const stage = m.stage;

    setVideoEnabled(self.videoEnabled ?? false);
    setCanProduceVideo(self.permissions?.canProduceVideo === 'ALLOWED');
    setVideoPermission(self.permissions?.video ?? 'NOT_REQUESTED');
    setStageStatus(stage?.status ?? 'OFF_STAGE');

    const onVideoUpdate = ({ videoEnabled }: any) => setVideoEnabled(videoEnabled);
    const onPermissionUpdate = ({ kind, message }: any) =>
      kind === 'video' && setVideoPermission(message);
    const onStageStatusUpdate = () => setStageStatus(stage?.status ?? 'OFF_STAGE');
    const onPermissionsUpdate = () =>
      setCanProduceVideo(self.permissions?.canProduceVideo === 'ALLOWED');

    self.addListener?.('videoUpdate', onVideoUpdate);
    self.addListener?.('mediaPermissionUpdate', onPermissionUpdate);
    self.addListener?.('permissionsUpdate', onPermissionsUpdate);
    stage?.addListener?.('stageStatusUpdate', onStageStatusUpdate);

    onCleanup(() => {
      self.removeListener?.('videoUpdate', onVideoUpdate);
      self.removeListener?.('mediaPermissionUpdate', onPermissionUpdate);
      self.removeListener?.('permissionsUpdate', onPermissionsUpdate);
      stage?.removeListener?.('stageStatusUpdate', onStageStatusUpdate);
    });
  });

  const hasPermissionError = () => ['DENIED', 'SYSTEM_DENIED'].includes(videoPermission());

  const toggleCamera = () => {
    const m = props.meeting;
    if (!m || !m.self || !canProduceVideo()) return;

    if (hasPermissionError()) {
      props.onStateUpdate?.({
        activePermissionsMessage: { enabled: true, kind: 'video' },
      });
      return;
    }

    const self = m.self;
    if (self?.videoEnabled) self?.disableVideo?.();
    else self?.enableVideo?.();
  };

  const label = () => (videoEnabled() && !hasPermissionError() ? t('video_on') : t('video_off'));

  const hidden =
    !canProduceVideo() ||
    props.meeting?.meta?.viewType === 'AUDIO_ROOM' ||
    ['OFF_STAGE', 'REQUESTED_TO_JOIN_STAGE'].includes(stageStatus());

  return (
    <Show when={!hidden}>
      <RtkControlbarButton
        size={props.size}
        label={label()}
        variant={props.variant}
        class={hasPermissionError() ? 'red-icon' : ''}
        showWarning={hasPermissionError()}
        onClick={toggleCamera}
      />
    </Show>
  );
}
