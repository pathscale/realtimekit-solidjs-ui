import { createSignal, onCleanup, onMount, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import type { RTKSelf } from '@cloudflare/realtimekit';

export interface RtkParticipantSetupProps {
  participant: RTKSelf;
  isPreview?: boolean;
  nameTagPosition?:
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'top-left'
    | 'top-right'
    | 'top-center';
  mirror?: boolean;
  size?: 'sm' | 'md' | 'lg';
  class?: string;
}

export default function RtkParticipantSetup(props: RtkParticipantSetupProps): JSX.Element {
  let videoEl: HTMLVideoElement | undefined;

  const [videoEnabled, setVideoEnabled] = createSignal(props.participant?.videoEnabled ?? false);
  const [isPinned, setIsPinned] = createSignal(props.participant?.isPinned ?? false);

  onMount(() => {
    if (!props.participant) return;

    props.participant.registerVideoElement(videoEl!, props.isPreview);

    setVideoEnabled(props.participant.videoEnabled ?? false);
    setIsPinned(props.participant.isPinned ?? false);

    const handleVideoUpdate = (state: { videoEnabled: boolean }) => {
      setVideoEnabled(state.videoEnabled);
    };

    (props.participant as any).addListener?.('videoUpdate', handleVideoUpdate);

    onCleanup(() => {
      props.participant.deregisterVideoElement(videoEl, props.isPreview);
      (props.participant as any).removeListener?.('videoUpdate', handleVideoUpdate);
    });
  });

  const isMirrored = () => props.mirror || props.isPreview;

  return (
    <div
      class={`bg-base-200 relative flex aspect-video h-56 select-none items-center justify-center overflow-hidden rounded-lg transition-all duration-150 ${
        props.class ?? ''
      }`}
    >
      <Show
        when={videoEnabled()}
        fallback={
          <div class="flex h-48 w-full flex-col items-center justify-center gap-2 opacity-70">
            <Show when={props.participant.picture}>
              <img
                src={props.participant.picture}
                alt="Participant picture"
                class="h-16 w-16 rounded-full object-cover"
              />
            </Show>
            <span class="text-sm">Camera off</span>
          </div>
        }
      >
        <video
          ref={videoEl!}
          class={`h-full w-full object-cover ${isMirrored() ? 'scale-x-[-1]' : ''}`}
          autoplay
          playsinline
          muted
        />
      </Show>
      <Show when={props.participant?.name}>
        <div
          class={`absolute rounded bg-black/60 px-2 py-1 text-xs font-medium text-white ${
            {
              'bottom-left': 'bottom-2 left-2',
              'bottom-right': 'bottom-2 right-2',
              'bottom-center': 'bottom-2 left-1/2 -translate-x-1/2',
              'top-left': 'top-2 left-2',
              'top-right': 'top-2 right-2',
              'top-center': 'top-2 left-1/2 -translate-x-1/2',
            }[props.nameTagPosition ?? 'bottom-left']
          }`}
        >
          {props.participant.name}
        </div>
      </Show>
    </div>
  );
}
