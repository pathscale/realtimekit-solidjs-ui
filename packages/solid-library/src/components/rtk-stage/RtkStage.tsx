import type { JSX } from 'solid-js';
import { splitProps } from 'solid-js';

export interface RtkStageProps {
  children?: JSX.Element;
  class?: string;
}

export default function RtkStage(allProps: RtkStageProps) {
  const [props, rest] = splitProps(allProps, ['children', 'class']);

  return (
    <div
      class={
        'bg-base-100 border-base-300 flex h-full w-full flex-col items-center justify-center rounded-lg border p-4' +
        (props.class ?? '')
      }
      {...rest}
    >
      {props.children}
    </div>
  );
}
