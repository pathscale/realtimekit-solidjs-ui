import { createSignal, createEffect, onCleanup, For, Show } from 'solid-js';
import { Flex, Card, Loading } from '@pathscale/ui';
import type { MeetingLike } from '~/types/rtk';

export interface RtkGridProps {
  meeting?: MeetingLike;
  aspectRatio?: string;
  gap?: number;
}

export default function RtkGrid(props: RtkGridProps) {
  const [participants, setParticipants] = createSignal<any[]>([]);
  const [self, setSelf] = createSignal<any>(null);
  const [roomState, setRoomState] = createSignal<string>('init');

  createEffect(() => {
    const meeting = props.meeting;
    if (!meeting) return;

    const updateParticipants = () => {
      try {
        const all = meeting.participants?.active?.toArray?.() || [];
        setParticipants(all);
        setSelf(meeting.self);
        setRoomState(meeting.self?.roomState ?? 'joined');
      } catch (err) {
        console.warn('Failed to update participants:', err);
      }
    };

    updateParticipants();

    meeting.participants?.active?.addListener?.('participantJoined', updateParticipants);
    meeting.participants?.active?.addListener?.('participantLeft', updateParticipants);

    onCleanup(() => {
      meeting.participants?.active?.removeListener?.('participantJoined', updateParticipants);
      meeting.participants?.active?.removeListener?.('participantLeft', updateParticipants);
    });
  });

  return (
    <Show
      when={props.meeting && roomState() === 'joined'}
      fallback={
        <Flex class="h-full w-full items-center justify-center">
          <Loading />
        </Flex>
      }
    >
      <Flex
        wrap="wrap"
        gap="md"
        class="h-full w-full items-center justify-center overflow-auto p-4"
      >
        <Show when={self()}>
          <Card
            border
            shadow="sm"
            class="bg-base-300 flex aspect-video min-w-[240px] flex-col items-center justify-center"
          >
            <video
              ref={(el) => self()?.registerVideoElement?.(el)}
              autoplay
              muted
              playsinline
              class="rounded-lg"
            />
            <p class="mt-2 text-sm opacity-80">{self().name || 'You'}</p>
          </Card>
        </Show>

        <For each={participants()}>
          {(p) => (
            <Card
              border
              shadow="sm"
              class="bg-base-200 flex aspect-video min-w-[240px] flex-col items-center justify-center"
            >
              <video
                ref={(el) => p.registerVideoElement?.(el)}
                autoplay
                playsinline
                class="rounded-lg"
              />
              <p class="mt-2 text-sm opacity-80">{p.name}</p>
            </Card>
          )}
        </For>
      </Flex>
    </Show>
  );
}
