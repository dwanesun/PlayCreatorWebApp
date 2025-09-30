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
  const { x, y, number, size = 12, strokeWidth = 4, ...handlers } = props;
  
  // Calculate subscript position (bottom right of the X)
  const subscriptSize = 20; // Smaller font size for subscript
  const subscriptOffsetX = size * 0.9; // Position to the right
  const subscriptOffsetY = size * 0.9; // Position at bottom right
  
  return (
    <Group x={x} y={y} {...handlers}>
      {/* X shape */}
      <Line points={[-size, -size, size, size]} stroke="#e63946" strokeWidth={strokeWidth} />
      <Line points={[-size, size, size, -size]} stroke="#e63946" strokeWidth={strokeWidth} />
      
      {/* Subscript number positioned at bottom right */}
      <Text 
        text={String(number)} 
        fill="#222"
        fontSize={subscriptSize}
        x={subscriptOffsetX} 
        y={subscriptOffsetY}
      />
    </Group>
  );
}
