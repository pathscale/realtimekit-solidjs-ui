import { createSignal, createEffect, onCleanup, Show } from 'solid-js';
import { Modal, Button, Flex } from '@pathscale/ui';
import type { MeetingLike } from '../../types/rtk';

export interface RtkParticipantsAudioProps {
  meeting?: MeetingLike;
}

export default function RtkParticipantsAudio(props: RtkParticipantsAudioProps) {
  const [audioMap, setAudioMap] = createSignal<Map<string, HTMLAudioElement>>(new Map());
  const [showPlayDialog, setShowPlayDialog] = createSignal(false);

  const addTrack = (id: string, track: MediaStreamTrack) => {
    if (!track) return;
    const existing = audioMap().get(id);
    if (existing) return;

    const el = document.createElement('audio');
    el.autoplay = true;
    // @ts-expect-error: playsInline is not officially part of HTMLAudioElement type but supported by browsers
    el.playsInline = true;
    el.srcObject = new MediaStream([track]);

    el.onplay = () => setShowPlayDialog(false);
    el.onerror = () => setShowPlayDialog(true);

    document.body.appendChild(el);
    setAudioMap((prev) => new Map(prev.set(id, el)));
  };

  const removeTrack = (id: string) => {
    const el = audioMap().get(id);
    if (el) {
      el.pause();
      el.srcObject = null;
      el.remove();
      const newMap = new Map(audioMap());
      newMap.delete(id);
      setAudioMap(newMap);
    }
  };

  createEffect(() => {
    const meeting = props.meeting;
    if (!meeting) return;

    const onAudioUpdate = ({ id, audioEnabled, audioTrack }: any) => {
      if (audioEnabled && audioTrack instanceof MediaStreamTrack) {
        addTrack(`audio-${id}`, audioTrack);
      } else {
        removeTrack(`audio-${id}`);
      }
    };

    const onParticipantLeft = ({ id }: any) => {
      removeTrack(`audio-${id}`);
      removeTrack(`screenshare-${id}`);
    };

    const onScreenShareUpdate = ({ id, screenShareEnabled, screenShareTracks }: any) => {
      const audioTrack = screenShareTracks?.audio;
      if (screenShareEnabled && audioTrack instanceof MediaStreamTrack) {
        addTrack(`screenshare-${id}`, audioTrack);
      } else {
        removeTrack(`screenshare-${id}`);
      }
    };

    try {
      const participants = meeting.participants?.joined?.toArray?.() || [];
      for (const p of participants) {
        const track = (p as any).audioTrack as MediaStreamTrack | undefined;
        if (p.audioEnabled && track) addTrack(`audio-${p.id}`, track);
      }
    } catch (err) {
      console.warn('Failed to init participant audio:', err);
    }

    meeting.participants?.joined?.addListener?.('audioUpdate', onAudioUpdate);
    meeting.participants?.joined?.addListener?.('participantLeft', onParticipantLeft);
    meeting.participants?.joined?.addListener?.('screenShareUpdate', onScreenShareUpdate);

    onCleanup(() => {
      meeting.participants?.joined?.removeListener?.('audioUpdate', onAudioUpdate);
      meeting.participants?.joined?.removeListener?.('participantLeft', onParticipantLeft);
      meeting.participants?.joined?.removeListener?.('screenShareUpdate', onScreenShareUpdate);

      for (const [, el] of audioMap()) {
        el.pause();
        el.srcObject = null;
        el.remove();
      }
      setAudioMap(new Map());
    });
  });

  return (
    <Show when={showPlayDialog()}>
      <Modal open onClose={() => setShowPlayDialog(false)} backdrop size="sm">
        <Modal.Header>
          <h3 class="text-lg font-semibold">Audio Playback</h3>
        </Modal.Header>
        <Modal.Body>
          <Flex direction="col" gap="md">
            <p class="text-base-content text-sm opacity-80">
              Click below to enable audio playback.
            </p>
            <Button
              fullWidth
              onClick={() => {
                for (const [, el] of audioMap()) {
                  el.play().catch(() => {});
                }
                setShowPlayDialog(false);
              }}
            >
              Enable Audio
            </Button>
          </Flex>
        </Modal.Body>
      </Modal>
    </Show>
  );
}
