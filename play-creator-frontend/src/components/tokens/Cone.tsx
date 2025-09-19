// src/components/tokens/ConeToken.tsx
import { Group, Line, Rect } from "react-konva";

export function Cone(props: {
  x: number; y: number; radius?: number;
  draggable?: boolean;
  onDragMove?: (e: any) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const { x, y, radius = 18, ...handlers } = props;
  return (
    <Group x={x} y={y} {...handlers}>
      <Line
        points={[0, -radius, -radius * 0.85, radius, radius * 0.85, radius]}
        closed
        fill="#f97316"
        stroke="#b45309"
        strokeWidth={2}
      />
      <Rect x={-radius * 0.7} y={radius * 0.2} width={radius * 1.4} height={radius * 0.25} fill="#fff" opacity={0.9} />
    </Group>
  );
}
