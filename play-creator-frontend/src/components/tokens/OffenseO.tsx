// src/components/tokens/OffenseO.tsx
import { Group, Circle, Text } from "react-konva";

export function OffenseO(props: {
  x: number; y: number; number: number; radius?: number;
  draggable?: boolean;
  onDragMove?: (e: any) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const { x, y, number, radius = 20, ...handlers } = props;
  return (
    <Group x={x} y={y} {...handlers}>
      <Circle radius={radius} stroke="#000" strokeWidth={3} fillEnabled={false} shadowBlur={2} />
      <Text text={String(number)} fill="#000" fontStyle="bold" fontSize={16} x={-6} y={-8} />
    </Group>
  );
}
