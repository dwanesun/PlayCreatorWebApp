import { useState } from "react";
import { Stage, Layer, Rect, Circle, Text } from "react-konva";

const COURT_WIDTH = 600;
const COURT_HEIGHT = 400;

export default function App() {
  // Initial positions for two draggable "players"
  const [playerA, setPlayerA] = useState({ x: COURT_WIDTH * 0.3, y: COURT_HEIGHT * 0.5 });
  const [playerB, setPlayerB] = useState({ x: COURT_WIDTH * 0.6, y: COURT_HEIGHT * 0.4 });

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <Stage width={COURT_WIDTH} height={COURT_HEIGHT}>
        <Layer>
          {/* Half-court background (simple rectangle for now) */}
          <Rect
            x={0}
            y={0}
            width={COURT_WIDTH}
            height={COURT_HEIGHT}
            fill="#f4a261" // court-like color
            cornerRadius={8}
            shadowBlur={5}
          />

          {/* Mid-court line */}
          <Rect x={COURT_WIDTH / 2 - 1} y={0} width={2} height={COURT_HEIGHT} fill="#ffffffaa" />

          {/* Players */}
          <Circle
            x={playerA.x}
            y={playerA.y}
            radius={18}
            fill="#2a9d8f"
            draggable
            onDragMove={(e) => setPlayerA({ x: e.target.x(), y: e.target.y() })}
          />
          <Text x={playerA.x - 5} y={playerA.y - 6} text="A" fill="#fff" fontStyle="bold" />

          <Circle
            x={playerB.x}
            y={playerB.y}
            radius={18}
            fill="#e76f51"
            draggable
            onDragMove={(e) => setPlayerB({ x: e.target.x(), y: e.target.y() })}
          />
          <Text x={playerB.x - 5} y={playerB.y - 6} text="B" fill="#fff" fontStyle="bold" />
        </Layer>
      </Stage>

      <div style={{ fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif" }}>
        <h3>Controls</h3>
        <p>Drag the circles to move players on the half-court.</p>
        <ul>
          <li>A: teal</li>
          <li>B: orange</li>
        </ul>
      </div>
    </div>
  );
}
