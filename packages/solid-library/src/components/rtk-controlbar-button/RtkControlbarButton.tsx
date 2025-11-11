import { Show, type JSX } from 'solid-js';
import { Button } from '@pathscale/ui';
import type { ComponentSize } from '@pathscale/ui/dist/components/types';

export type ControlBarVariant = 'button' | 'horizontal';
export interface RtkControlbarButtonProps {
  variant?: ControlBarVariant;
  showWarning?: boolean;
  size?: ComponentSize;
  label?: string;
  icon?: JSX.Element;
  warningIcon?: JSX.Element;
  isLoading?: boolean;
  disabled?: boolean;
  active?: boolean;
  brandIcon?: boolean;
  onClick?: () => void;
  class?: string;
}

export default function RtkControlbarButton(props: RtkControlbarButtonProps) {
  const isHorizontal = props.variant === 'horizontal';

  const baseClass = () =>
    [
      'relative flex items-center transition-all select-none',
      isHorizontal
        ? 'w-full justify-start px-4 py-2 rounded-md gap-3'
        : 'aspect-square justify-center rounded-md',
      props.active ? 'text-brand-400 border border-brand-400' : '',
      props.brandIcon ? 'text-brand' : '',
      props.class ?? '',
    ].join(' ');

  return (
    <div class={baseClass()}>
      <Button
        size={props.size ?? 'md'}
        variant={isHorizontal ? 'outlined' : 'filled'}
        color={props.showWarning ? 'warning' : 'neutral'}
        loading={props.isLoading}
        disabled={props.disabled}
        onClick={props.onClick}
        startIcon={props.icon}
        aria-label={props.label}
        class="flex flex-1 items-center justify-center gap-2"
      >
        <Show when={isHorizontal}>
          <span class="label line-clamp-1 text-sm">{props.label}</span>
        </Show>
      </Button>

      <Show when={props.showWarning && props.warningIcon}>
        <span class="text-warning absolute top-1 right-2 h-4 w-4">{props.warningIcon}</span>
      </Show>
    </div>
  );
}
