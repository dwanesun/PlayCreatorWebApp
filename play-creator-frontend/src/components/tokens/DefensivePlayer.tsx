// src/components/tokens/DefenseX.tsx
import { Group, Line, Text } from "react-konva";

export function DefensivePlayer(props: {
  x: number; y: number; number: number; size?: number; strokeWidth?: number;
  draggable?: boolean;
  onDragMove?: (e: any) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const { x, y, number, size = 14, strokeWidth = 5, ...handlers } = props;
  return (
    <Group x={x} y={y} {...handlers}>
      <Line points={[-size, -size, size, size]} stroke="#e63946" strokeWidth={strokeWidth} />
      <Line points={[-size, size, size, -size]} stroke="#e63946" strokeWidth={strokeWidth} />
      <Text text={String(number)} fill="#222" fontStyle="bold" fontSize={12} x={-5} y={size + 4} />
    </Group>
  );
}
