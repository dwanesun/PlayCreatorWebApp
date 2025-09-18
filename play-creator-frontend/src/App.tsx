import { useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Text, Group, Line, Arc } from "react-konva";

// Canvas and court geometry
// High School dimensions + scale
const SCALE = 10; // pixels per foot
const BUFFER = 60; // px out-of-bounds area around the court
const ft = (feet: number) => feet * SCALE;

// Half-court (HS): 50 ft wide (sideline to sideline), 42 ft long (baseline to midcourt)
const COURT_WIDTH = ft(50);
const COURT_HEIGHT = ft(42);
const STAGE_WIDTH = COURT_WIDTH + BUFFER * 2;
const STAGE_HEIGHT = COURT_HEIGHT + BUFFER * 2;
const COURT_X = BUFFER;
const COURT_Y = BUFFER;

// HS key distances (in feet)
const BACKBOARD_FROM_BASELINE_FT = 4;
const HOOP_CENTER_FROM_BASELINE_FT = 5.25; // 63 inches
const LANE_WIDTH_FT = 12;
const FREE_THROW_FROM_BASELINE_FT = BACKBOARD_FROM_BASELINE_FT + 15; // 19 ft
const FREE_THROW_RADIUS_FT = 6;
const THREE_ARC_RADIUS_FT = 19.75; // 19' 9"

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

  // Court feature coordinates (in px)
  const baselineY = COURT_Y; // top
  const halfCourtY = COURT_Y + COURT_HEIGHT; // bottom
  const leftSidelineX = COURT_X;
  const rightSidelineX = COURT_X + COURT_WIDTH;
  const centerX = COURT_X + COURT_WIDTH / 2;

  const hoopY = baselineY + ft(HOOP_CENTER_FROM_BASELINE_FT);
  const hoopR = 9; // px visual radius for the rim

  const backboardY = baselineY + ft(BACKBOARD_FROM_BASELINE_FT);
  const backboardW = ft(6); // 6 ft wide
  const backboardX = centerX - backboardW / 2;

  const laneLeftX = centerX - ft(LANE_WIDTH_FT) / 2;
  const laneRightX = centerX + ft(LANE_WIDTH_FT) / 2;
  const laneBottomY = baselineY + ft(FREE_THROW_FROM_BASELINE_FT);

  const ftLineY = laneBottomY;
  const ftCircleR = ft(FREE_THROW_RADIUS_FT);

  const threeR = ft(THREE_ARC_RADIUS_FT);

  // Default drop spots spaced across the court area
  const defaultSpots = useMemo(
    () => [
      { x: COURT_X + COURT_WIDTH * 0.30, y: COURT_Y + COURT_HEIGHT * 0.50 },
      { x: COURT_X + COURT_WIDTH * 0.40, y: COURT_Y + COURT_HEIGHT * 0.40 },
      { x: COURT_X + COURT_WIDTH * 0.50, y: COURT_Y + COURT_HEIGHT * 0.60 },
      { x: COURT_X + COURT_WIDTH * 0.60, y: COURT_Y + COURT_HEIGHT * 0.35 },
      { x: COURT_X + COURT_WIDTH * 0.70, y: COURT_Y + COURT_HEIGHT * 0.55 },
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
        y: clamp(spot.y, 30, STAGE_HEIGHT - 30),
      },
    ]);
  };

  const updatePlayer = (id: string, pos: { x: number; y: number }) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...pos } : p)));
  };

  // Keep draggable tokens inside the full canvas (including out-of-bounds buffer)
  const boundToCanvas = (x: number, y: number, radius = 20) => {
    return {
      x: clamp(x, radius, STAGE_WIDTH - radius),
      y: clamp(y, radius, STAGE_HEIGHT - radius),
    };
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: 12 }}>
      {/* The canvas area grows, toolbox is a fixed right panel */}
      <div style={{ flex: 1 }}>
        <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
          <Layer>
            {/* Canvas background */}
            <Rect x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="#ffffff" />
            {/* Court outline */}
            <Rect
              x={COURT_X}
              y={COURT_Y}
              width={COURT_WIDTH}
              height={COURT_HEIGHT}
              stroke="#1f2937"
              strokeWidth={2}
              cornerRadius={4}
            />
            {/* Baseline, sidelines, half-court line */}
            <Line points={[leftSidelineX, baselineY, rightSidelineX, baselineY]} stroke="#1f2937" strokeWidth={2} />
            <Line points={[leftSidelineX, baselineY, leftSidelineX, halfCourtY]} stroke="#1f2937" strokeWidth={2} />
            <Line points={[rightSidelineX, baselineY, rightSidelineX, halfCourtY]} stroke="#1f2937" strokeWidth={2} />
            <Line points={[leftSidelineX, halfCourtY, rightSidelineX, halfCourtY]} stroke="#1f2937" strokeWidth={2} />

            {/* Backboard */}
            <Rect x={backboardX} y={backboardY} width={backboardW} height={2} fill="#1f2937" />

            {/* Hoop (rim) */}
            <Circle x={centerX} y={hoopY} radius={hoopR} stroke="#1f2937" strokeWidth={2} />

            {/* Lane (key) */}
            <Rect
              x={laneLeftX}
              y={baselineY}
              width={laneRightX - laneLeftX}
              height={laneBottomY - baselineY}
              stroke="#1f2937"
              strokeWidth={2}
            />

            {/* Free-throw line */}
            <Line points={[laneLeftX, ftLineY, laneRightX, ftLineY]} stroke="#1f2937" strokeWidth={2} />

            {/* Free-throw circle: upper half solid, lower half dashed (common on many courts) */}
            <Arc
              x={centerX}
              y={ftLineY}
              innerRadius={ftCircleR}
              outerRadius={ftCircleR}
              angle={180}
              rotation={180} // open downward toward the basket
              stroke="#1f2937"
              strokeWidth={2}
            />
            <Arc
              x={centerX}
              y={ftLineY}
              innerRadius={ftCircleR}
              outerRadius={ftCircleR}
              angle={180}
              rotation={0} // open upward
              stroke="#1f2937"
              strokeWidth={2}
              dash={[6, 6]}
            />

            {/* High School three-point arc (no corner straight lines) */}
            <Arc
              x={centerX}
              y={hoopY}
              innerRadius={threeR}
              outerRadius={threeR}
              angle={180}
              rotation={180} // open downward into the court
              stroke="#1f2937"
              strokeWidth={2}
            />

            {/* Players */}
            {players.map((p) => {
              const radius = 20;

              const onDragMove = (e: any) => {
                const { x, y } = boundToCanvas(e.target.x(), e.target.y(), radius);
                updatePlayer(p.id, { x, y });
              };

              const onMouseEnter = () => (document.body.style.cursor = "grab");
              const onDragStart = () => (document.body.style.cursor = "grabbing");
              const onDragEnd = () => (document.body.style.cursor = "default");
              const onMouseLeave = () => (document.body.style.cursor = "default");

              if (p.team === "offense") {
                // Offense: hollow circle with a number
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
                      stroke="#000"
                      strokeWidth={3}
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

              // Defense: X shape with a small number below (smaller size)
              const size = 14;
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
                <Line points={[-size, -size, size, size]} stroke="#e63946" strokeWidth={5} />
                <Line points={[-size, size, size, -size]} stroke="#e63946" strokeWidth={5} />
                <Text text={String(p.number)} fill="#222" fontStyle="bold" fontSize={12} x={-5} y={size + 4} />
              </Group>
            );
          })}

          {/* Cones */}
          {cones.map((c) => {
            const radius = 18;
            const onDragMove = (e: any) => {
              const { x, y } = boundToCanvas(e.target.x(), e.target.y(), radius);
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
                {/* Simple cone: orange triangle and white stripe */}
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
        fontFamily: "system-ui, -apple-system, Segue UI, Roboto, Helvetica, Arial, sans-serif",
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
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
                style={{ display: "block" }}
              >
                {/* Cone body */}
                <path d="M12 3 L19 20 H5 Z" fill="#f97316" stroke="#b45309" strokeWidth={1.5} />
                {/* White stripe */}
                <rect x="7.2" y="13" width="9.6" height="2" fill="#ffffff" opacity={0.9} />
              </svg>
              <span>Cone</span>
            </button>
          </div>
        </section>
    </aside>
  </div>
);
}
