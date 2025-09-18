import { useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Text, Group, Line } from "react-konva";

const COURT_WIDTH = 800;
const COURT_HEIGHT = 450;

type Team = "offense" | "defense";

type Player = {
  id: string;
  team: Team;
  number: 1 | 2 | 3 | 4 | 5;
  x: number;
  y: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const nextId = useRef(1);

  // Precompute default drop positions to avoid total overlap when adding multiple quickly
  const defaultSpots = useMemo(
    () => [
      { x: COURT_WIDTH * 0.30, y: COURT_HEIGHT * 0.50 },
      { x: COURT_WIDTH * 0.40, y: COURT_HEIGHT * 0.40 },
      { x: COURT_WIDTH * 0.50, y: COURT_HEIGHT * 0.60 },
      { x: COURT_WIDTH * 0.60, y: COURT_HEIGHT * 0.35 },
      { x: COURT_WIDTH * 0.70, y: COURT_HEIGHT * 0.55 },
    ],
    []
  );

  const addPlayer = (team: Team, number: 1 | 2 | 3 | 4 | 5) => {
    const i = (players.length) % defaultSpots.length;
    const spot = defaultSpots[i];
    setPlayers((prev) => [
      ...prev,
      {
        id: `${team}-${number}-${nextId.current++}`,
        team,
        number,
        x: spot.x,
        y: spot.y,
      },
    ]);
  };

  const updatePlayer = (id: string, pos: { x: number; y: number }) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...pos } : p)));
  };

  // Keep draggable tokens inside court bounds
  const boundToCourt = (x: number, y: number, radius = 20) => {
    return {
      x: clamp(x, radius, COURT_WIDTH - radius),
      y: clamp(y, radius, COURT_HEIGHT - radius),
    };
  };

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 12 }}>
      {/* Add Players Toolbox */}
      <div
        style={{
          width: 220,
          padding: 12,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Add Players</h3>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Offense</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={`o${n}`}
                onClick={() => addPlayer("offense", n as 1 | 2 | 3 | 4 | 5)}
                style={{
                  padding: "6px 0",
                  borderRadius: 6,
                  border: "1px solid #2a9d8f",
                  background: "#e8f7f4",
                  color: "#1f6f65",
                  cursor: "pointer",
                }}
                title={`Add Offense ${n}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Defense</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={`d${n}`}
                onClick={() => addPlayer("defense", n as 1 | 2 | 3 | 4 | 5)}
                style={{
                  padding: "6px 0",
                  borderRadius: 6,
                  border: "1px solid #c0392b",
                  background: "#fdecea",
                  color: "#972c23",
                  cursor: "pointer",
                }}
                title={`Add Defense ${n}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <Stage width={COURT_WIDTH} height={COURT_HEIGHT}>
        <Layer>
          {/* Half-court background */}
          <Rect
            x={0}
            y={0}
            width={COURT_WIDTH}
            height={COURT_HEIGHT}
            fill="#f4a261"
            cornerRadius={10}
            shadowBlur={5}
          />
          {/* Mid-court line */}
          <Rect x={COURT_WIDTH / 2 - 1} y={0} width={2} height={COURT_HEIGHT} fill="#ffffffaa" />

          {/* Players */}
          {players.map((p) => {
            const radius = 20;

            const onDragMove = (e: any) => {
              const { x, y } = boundToCourt(e.target.x(), e.target.y(), radius);
              updatePlayer(p.id, { x, y });
            };

            const onMouseEnter = () => {
              document.body.style.cursor = "grab";
            };
            const onDragStart = () => {
              document.body.style.cursor = "grabbing";
            };
            const onDragEnd = () => {
              document.body.style.cursor = "default";
            };
            const onMouseLeave = () => {
              document.body.style.cursor = "default";
            };

            if (p.team === "offense") {
              // Offense: circle with number
              return (
                <Group
                  key={p.id}
                  x={p.x}
                  y={p.y}
                  draggable
                  onDragMove={onDragMove}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                >
                  <Circle
                    radius={radius}
                    stroke="#2a9d8f"
                    strokeWidth={5}
                    fillEnabled={false}
                    shadowBlur={2}
                  />
                  <Text
                    text={String(p.number)}
                    fill="#000"
                    fontStyle="bold"
                    fontSize={16}
                    x={-6}
                    y={-8}
                  />
                </Group>
              );
            }

            // Defense: X shape with a small number below
            const size = 12; // X arm half-length
            return (
              <Group
                key={p.id}
                x={p.x}
                y={p.y}
                draggable
                onDragMove={onDragMove}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              >
                {/* Two crossing lines to form an X */}
                <Line points={[-size, -size, size, size]} stroke="#e63946" strokeWidth={5} />
                <Line points={[-size, size, size, -size]} stroke="#e63946" strokeWidth={5} />
                {/* Number below the X */}
                <Text
                  text={String(p.number)}
                  fill="#222"
                  fontStyle="bold"
                  fontSize={14}
                  x={-5}
                  y={size + 4}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
