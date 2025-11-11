import { ParentProps, splitProps } from 'solid-js';
import type { ComponentSize } from '@pathscale/ui/dist/components/types';
import { Card, Flex } from '@pathscale/ui';

export interface RtkControlbarProps extends ParentProps {
  variant?: 'solid' | 'boxed';
  disableRender?: boolean;
  size?: ComponentSize;
  class?: string;
}

export default function RtkControlbar(allProps: RtkControlbarProps) {
  const [props, rest] = splitProps(allProps, [
    'variant',
    'disableRender',
    'size',
    'class',
    'children',
  ]);

  if (props.disableRender) return null;

  const cardVariant = props.variant === 'boxed' ? 'border' : 'filled';
  const background = props.variant === 'boxed' ? 'base-200' : 'base-300';

  return (
    <Card
      variant={cardVariant as any}
      background={background}
      shadow="md"
      fullWidth
      class={`rounded-2xl p-2 sm:p-3 ${props.class ?? ''}`}
      {...rest}
    >
      <Flex
        align="center"
        justify="center"
        gap={props.size === 'lg' ? 'lg' : props.size === 'sm' ? 'sm' : 'md'}
        wrap="wrap"
      >
        {props.children}
      </Flex>
    </Card>
  );
}
