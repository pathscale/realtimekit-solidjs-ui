import { createSignal, createEffect, onCleanup, Show, type JSX } from 'solid-js';
import { Button, Tooltip, toastStore } from '@pathscale/ui';
import type { ComponentSize, ComponentVariant } from '@pathscale/ui/dist/components/types';
import type { MeetingLike } from '~/types/rtk';

export interface RtkCameraToggleProps {
  meeting?: MeetingLike;
  size?: ComponentSize;
  variant?: ComponentVariant;
  videoOnIcon?: JSX.Element;
  videoOffIcon?: JSX.Element;
  t?: (key: string) => string;
  onStateUpdate?: (state: any) => void;
}

export default function RtkCameraToggle(props: RtkCameraToggleProps) {
  const [videoEnabled, setVideoEnabled] = createSignal(false);
  const [canProduceVideo, setCanProduceVideo] = createSignal(false);
  const [stageStatus, setStageStatus] = createSignal<string>('OFF_STAGE');
  const [videoPermission, setVideoPermission] = createSignal('NOT_REQUESTED');

  const t = props.t ?? ((key: string) => key);

  createEffect(() => {
    const m = props.meeting;
    if (!m || !m.self) return;

    const self = m.self;
    const stage = m.stage;

    setVideoEnabled(self.videoEnabled ?? false);
    setCanProduceVideo(self.permissions?.canProduceVideo === 'ALLOWED');
    setStageStatus(stage?.status ?? 'OFF_STAGE');
    setVideoPermission(self.mediaPermissions?.video ?? 'NOT_REQUESTED');

    const onVideoUpdate = ({ videoEnabled }: any) => setVideoEnabled(videoEnabled);
    const onStageStatusUpdate = () => setStageStatus(stage?.status ?? 'OFF_STAGE');
    const onPermissionUpdate = ({ kind, message }: any) =>
      kind === 'video' && setVideoPermission(message);
    const onPermissionsUpdate = () =>
      setCanProduceVideo(self.permissions?.canProduceVideo === 'ALLOWED');

    self.addListener?.('videoUpdate', onVideoUpdate);
    stage?.addListener?.('stageStatusUpdate', onStageStatusUpdate);
    self.addListener?.('mediaPermissionUpdate', onPermissionUpdate);
    self.permissions?.addListener?.('permissionsUpdate', onPermissionsUpdate);

    onCleanup(() => {
      self.removeListener?.('videoUpdate', onVideoUpdate);
      stage?.removeListener?.('stageStatusUpdate', onStageStatusUpdate);
      self.removeListener?.('mediaPermissionUpdate', onPermissionUpdate);
      self.permissions?.removeListener?.('permissionsUpdate', onPermissionsUpdate);
    });
  });

  const hasPermissionError = () => ['DENIED', 'SYSTEM_DENIED'].includes(videoPermission());

  const couldNotStart = () => videoPermission() === 'COULD_NOT_START';

  const toggleCamera = () => {
    const m = props.meeting;
    if (!m || !m.self || !canProduceVideo()) return;

    if (hasPermissionError()) {
      props.onStateUpdate?.({
        activePermissionsMessage: { enabled: true, kind: 'video' },
      });
      toastStore.showError('Camera permission denied.');
      return;
    }

    const self = m.self;
    if (self.videoEnabled) {
      self.disableVideo();
      toastStore.showInfo('Camera turned off.');
    } else {
      self.enableVideo();
      toastStore.showSuccess('Camera turned on.');
    }
  };

  const tooltipLabel = () => {
    if (couldNotStart()) return t('perm_could_not_start.video');
    if (videoPermission() === 'SYSTEM_DENIED') return t('perm_sys_denied.video');
    if (videoPermission() === 'DENIED') return t('perm_denied.video');
    return videoEnabled() ? t('disable_video') : t('enable_video');
  };

  const buttonLabel = () =>
    videoEnabled() && !hasPermissionError() ? t('video_on') : t('video_off');

  const hidden =
    !canProduceVideo() ||
    props.meeting?.meta?.viewType === 'AUDIO_ROOM' ||
    ['OFF_STAGE', 'REQUESTED_TO_JOIN_STAGE'].includes(stageStatus());

  return (
    <Show when={!hidden}>
      <Tooltip message={tooltipLabel()} position="top">
        <Button
          size={props.size ?? 'md'}
          variant={props.variant ?? 'filled'}
          color={hasPermissionError() ? 'error' : 'primary'}
          active={videoEnabled()}
          disabled={hasPermissionError()}
          onClick={toggleCamera}
          startIcon={videoEnabled() ? props.videoOnIcon : props.videoOffIcon}
        >
          {buttonLabel()}
        </Button>
      </Tooltip>
    </Show>
  );
}
