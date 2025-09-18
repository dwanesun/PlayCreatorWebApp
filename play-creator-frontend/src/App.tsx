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

type Cone = {
  id: string;
  x: number;
  y: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [cones, setCones] = useState<Cone[]>([]);
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
    const i = players.length % defaultSpots.length;
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

  const addCone = () => {
    const i = cones.length % defaultSpots.length;
    const spot = defaultSpots[i];
    setCones((prev) => [
      ...prev,
      {
        id: `cone-${nextId.current++}`,
        x: spot.x,
        y: clamp(spot.y, 30, COURT_HEIGHT - 30),
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
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: 12 }}>
      {/* Canvas area grows, toolbox is a fixed right panel */}
      <div style={{ flex: 1 }}>
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

              const onMouseEnter = () => (document.body.style.cursor = "grab");
              const onDragStart = () => (document.body.style.cursor = "grabbing");
              const onDragEnd = () => (document.body.style.cursor = "default");
              const onMouseLeave = () => (document.body.style.cursor = "default");

              if (p.team === "offense") {
                // Offense: hollow circle with thick black border and black number
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
                    <Circle radius={radius} stroke="#000" strokeWidth={5} fillEnabled={false} shadowBlur={2} />
                    <Text text={String(p.number)} fill="#000" fontStyle="bold" fontSize={16} x={-6} y={-8} />
                  </Group>
                );
              }

              // Defense: X shape with small number below (smaller size)
              const size = 18;
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
                  <Line points={[-size, -size, size, size]} stroke="#e63946" strokeWidth={3} />
                  <Line points={[-size, size, size, -size]} stroke="#e63946" strokeWidth={3} />
                  <Text text={String(p.number)} fill="#222" fontStyle="bold" fontSize={12} x={-5} y={size + 4} />
                </Group>
              );
            })}

            {/* Cones */}
            {cones.map((c) => {
              const radius = 18;
              const onDragMove = (e: any) => {
                const { x, y } = boundToCourt(e.target.x(), e.target.y(), radius);
                setCones((prev) => prev.map((cn) => (cn.id === c.id ? { ...cn, x, y } : cn)));
              };
              const onMouseEnter = () => (document.body.style.cursor = "grab");
              const onDragStart = () => (document.body.style.cursor = "grabbing");
              const onDragEnd = () => (document.body.style.cursor = "default");
              const onMouseLeave = () => (document.body.style.cursor = "default");

              return (
                <Group
                  key={c.id}
                  x={c.x}
                  y={c.y}
                  draggable
                  onDragMove={onDragMove}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                >
                  {/* Simple cone: orange triangle + white stripe */}
                  {/* Using a Path-less approach: triangle via Line (closed) for wider support */}
                  <Line
                    points={[0, -radius, -radius * 0.85, radius, radius * 0.85, radius]}
                    closed
                    fill="#f97316"
                    stroke="#b45309"
                    strokeWidth={2}
                  />
                  {/* Stripe */}
                  <Rect x={-radius * 0.7} y={radius * 0.2} width={radius * 1.4} height={radius * 0.25} fill="#fff" opacity={0.85} />
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>

      {/* Right toolbox panel */}
      <aside
        style={{
          width: 280,
          height: COURT_HEIGHT,
          padding: 12,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          overflowY: "auto",
        }}
      >
        {/* Add Actions (placeholder) */}
        <section>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Add Actions</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Dribble", "Pass", "Cut", "Screen", "Shot", "Handoff"].map((label) => (
              <button
                key={label}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  cursor: "not-allowed",
                  color: "#475569",
                }}
                title={`${label} (coming soon)`}
                disabled
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

        {/* Add Players */}
        <section>
          <h3 style={{ margin: 0, marginBottom: 8 }}>Add Players</h3>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Offense (O)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={`o${n}`}
                  onClick={() => addPlayer("offense", n as 1 | 2 | 3 | 4 | 5)}
                  style={{
                    padding: "6px 0",
                    borderRadius: 6,
                    border: "1px solid #0f172a",
                    background: "#ffffff",
                    color: "#0f172a",
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
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Defense (X)</div>
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
        </section>

        {/* Divider */}
        <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

        {/* Add misc */}
        <section>
          <h3 style={{ margin: 0, marginBottom: 8 }}>Add misc</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={addCone}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #fb923c",
                background: "#fff7ed",
                color: "#c2410c",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              title="Add Cone"
            >
              <span aria-hidden="true">🚧</span>
              <span>Cone</span>
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}
