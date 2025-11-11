import { createSignal, createEffect, onCleanup, Show, type JSX } from 'solid-js';
import { Button, Tooltip } from '@pathscale/ui';
import type {
  ComponentColor,
  ComponentSize,
  ComponentVariant,
} from '@pathscale/ui/dist/components/types';
import type { MeetingLike } from '~/types/rtk';

export interface RtkMicToggleProps {
  meeting?: MeetingLike;
  size?: ComponentSize;
  color?: ComponentColor;
  variant?: ComponentVariant;
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
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
    setMicPermission(m.self.mediaPermissions?.audio ?? 'NOT_REQUESTED');
    setCanProduceAudio(m.self.permissions?.canProduceAudio === 'ALLOWED');
    setStageStatus(m.stage?.status ?? 'OFF_STAGE');

    const onAudioUpdate = ({ audioEnabled }: any) => setAudioEnabled(audioEnabled);
    const onPermissionUpdate = ({ kind, message }: any) =>
      kind === 'audio' && setMicPermission(message);
    const onStageUpdate = () => {
      setStageStatus(m.stage?.status ?? 'OFF_STAGE');
      setCanProduceAudio(m.self?.permissions?.canProduceAudio === 'ALLOWED');
    };
    const onPermissionsUpdate = () =>
      setCanProduceAudio(m.self?.permissions?.canProduceAudio === 'ALLOWED');

    m.self?.addListener?.('audioUpdate', onAudioUpdate);
    m.self?.addListener?.('mediaPermissionUpdate', onPermissionUpdate);
    m.stage?.addListener?.('stageStatusUpdate', onStageUpdate);
    m.self?.permissions?.addListener?.('permissionsUpdate', onPermissionsUpdate);

    onCleanup(() => {
      m.self?.removeListener?.('audioUpdate', onAudioUpdate);
      m.self?.removeListener?.('mediaPermissionUpdate', onPermissionUpdate);
      m.stage?.removeListener?.('stageStatusUpdate', onStageUpdate);
      m.self?.permissions?.removeListener?.('permissionsUpdate', onPermissionsUpdate);
    });
  });

  const hasPermissionError = () => ['DENIED', 'SYSTEM_DENIED'].includes(micPermission());

  const couldNotStart = () => micPermission() === 'COULD_NOT_START';

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
    self?.audioEnabled ? self.disableAudio() : self.enableAudio();
  };

  const label = () => (audioEnabled() && !hasPermissionError() ? t('mic_on') : t('mic_off'));

  const tooltipLabel = () => {
    if (couldNotStart()) return t('perm_could_not_start.audio');
    if (micPermission() === 'SYSTEM_DENIED') return t('perm_sys_denied.audio');
    if (micPermission() === 'DENIED') return t('perm_denied.audio');
    return audioEnabled() ? t('disable_mic') : t('enable_mic');
  };

  const isHidden = () =>
    !canProduceAudio() || ['OFF_STAGE', 'REQUESTED_TO_JOIN_STAGE'].includes(stageStatus());

  const [volumeLevel, setVolumeLevel] = createSignal(0);

  createEffect(() => {
    const m = props.meeting;
    const audioTrack = m?.self?.audioTrack;
    if (!audioTrack) return;

    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
    const analyser = ctx.createAnalyser();
    const data = new Uint8Array(analyser.frequencyBinCount);
    src.connect(analyser);

    const loop = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setVolumeLevel(avg / 255);
      requestAnimationFrame(loop);
    };
    loop();
  });

  createEffect(() => {
    console.log('Mic enabled:', props.meeting?.self?.audioEnabled);
    console.log('Cam enabled:', props.meeting?.self?.videoEnabled);
  });

  return (
    <Show when={!isHidden()}>
      <Tooltip message={tooltipLabel()} position="top">
        <Button
          size={props.size ?? 'md'}
          color={hasPermissionError() ? 'error' : 'primary'}
          variant={props.variant ?? 'filled'}
          active={audioEnabled()}
          disabled={hasPermissionError()}
          startIcon={props.startIcon}
          endIcon={props.endIcon}
          onClick={toggleMic}
        >
          {label()}
        </Button>
      </Tooltip>
      <div class="bg-base-200 mt-1 h-1 overflow-hidden rounded-full">
        <div
          class="bg-success h-full transition-all"
          style={{ width: `${volumeLevel() * 100}%` }}
        />
      </div>
    </Show>
  );
}
