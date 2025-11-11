import { createContext, useContext, createSignal, onMount, onCleanup, JSX, Show } from 'solid-js';
import type { MeetingLike } from '../../types/rtk';

export interface RtkUiProviderProps {
  meeting?: MeetingLike | null;
  config?: Record<string, any>;
  mode?: 'fixed' | 'fill';
  showSetupScreen?: boolean;
  children?: JSX.Element;
}

interface RtkUiContextValue {
  meeting?: MeetingLike | null;
  meetingState: () => string;
  setMeetingState: (state: string) => void;
}

const RtkUiContext = createContext<RtkUiContextValue>();

export function useRtkUi() {
  const ctx = useContext(RtkUiContext);
  if (!ctx) throw new Error('useRtkUi must be used within <RtkUiProvider>');
  return ctx;
}

export default function RtkUiProvider(props: RtkUiProviderProps) {
  const [meetingState, setMeetingState] = createSignal('setup');

  onMount(() => {
    const currentState = props.meeting?.self?.roomState;
    if (currentState === 'joined' || currentState === 'connected') {
      setMeetingState('joined');
    }

    const onRoomJoined = () => setMeetingState('joined');
    const onRoomLeft = () => setMeetingState('ended');
    const onWaitlisted = () => setMeetingState('waiting');

    props.meeting?.self?.addListener?.('roomJoined', onRoomJoined);
    props.meeting?.self?.addListener?.('waitlisted', onWaitlisted);
    props.meeting?.self?.addListener?.('roomLeft', onRoomLeft);

    onCleanup(() => {
      props.meeting?.self?.removeListener?.('roomJoined', onRoomJoined);
      props.meeting?.self?.removeListener?.('waitlisted', onWaitlisted);
      props.meeting?.self?.removeListener?.('roomLeft', onRoomLeft);
    });
  });

  return (
    <RtkUiContext.Provider
      value={{
        meeting: props.meeting,
        meetingState,
        setMeetingState,
      }}
    >
      <div
        class={`bg-background-1000 text-text-900 box-border flex flex-col overflow-hidden ${
          props.mode === 'fill' ? 'relative' : 'fixed inset-0 h-full w-full'
        }`}
      >
        <Show when={props.meeting}>{props.children}</Show>
      </div>
    </RtkUiContext.Provider>
  );
}
