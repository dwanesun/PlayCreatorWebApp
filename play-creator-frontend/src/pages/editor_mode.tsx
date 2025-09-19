// src/pages/EditorMode.tsx
import { useMemo, useRef, useState } from "react";
import { Stage, Rect, Layer } from "react-konva";
import { CourtHalf } from "../components/court/half_court_components";
import { OffenseO } from "../components/tokens/OffenseO";
import { DefenseX } from "../components/tokens/DefenseX";
import { ConeToken } from "../components/tokens/ConeToken";
import type { PlayerTokenType } from "../components/tokens/PlayerTokenType";
import type { ConeTokenType } from "../components/tokens/ConeTokenType";
import {
  STAGE_WIDTH,
  STAGE_HEIGHT,
  COURT_WIDTH,
  COURT_HEIGHT,
  COURT_X,
  COURT_Y,
} from "../components/geometry/CourtGeometryUtils";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function EditorMode() {
  const [players, setPlayers] = useState<PlayerTokenType[]>([]);
  const [cones, setCones] = useState<ConeTokenType[]>([]);
  const nextId = useRef(1);

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

  const boundToCanvas = (x: number, y: number, radius = 20) => ({
    x: clamp(x, radius, STAGE_WIDTH - radius),
    y: clamp(y, radius, STAGE_HEIGHT - radius),
  });

  const addPlayer = (team: "offense" | "defense", number: 1 | 2 | 3 | 4 | 5) => {
    const i = players.length % defaultSpots.length;
    const spot = defaultSpots[i];
    setPlayers((prev) => [
      ...prev,
      { id: `${team}-${number}-${nextId.current++}`, team, number, x: spot.x, y: spot.y },
    ]);
  };

  const addCone = () => {
    const i = cones.length % defaultSpots.length;
    const spot = defaultSpots[i];
    setCones((prev) => [...prev, { id: `cone-${nextId.current++}`, x: spot.x, y: spot.y }]);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
        padding: 24,
        minHeight: "100vh",
        boxSizing: "border-box",
        background: "#fff",
      }}
    >
      {/* Left: Phases placeholder */}
      <aside
        style={{
          width: 260,
          height: STAGE_HEIGHT,
          padding: 12,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h3 style={{ margin: 0 }}>Phases</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Next", "Clone", "Empty"].map((label) => (
            <button
              key={label}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                cursor: "pointer",
                color: "#1f2937",
              }}
              title={label}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ height: 1, background: "#eee", margin: "4px 0" }} />
        <div style={{ color: "#64748b", fontSize: 12 }}>Phase timeline and controls coming soon…</div>
      </aside>

      {/* Center: Canvas */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
          {/* Background must be inside a Layer */}
          <Layer>
            <Rect x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="#ffffff" />
          </Layer>
          {/* Court (already returns a Layer internally) */}
          <CourtHalf />

          {/* Tokens must be inside a Layer too */}
          <Layer>
            {players.map((p) => {
              const radius = 20;
              const handlers = {
                draggable: true,
                onDragMove: (e: any) => {
                  const { x, y } = boundToCanvas(e.target.x(), e.target.y(), radius);
                  setPlayers((prev) => prev.map((pp) => (pp.id === p.id ? { ...pp, x, y } : pp)));
                },
                onMouseEnter: () => (document.body.style.cursor = "grab"),
                onMouseLeave: () => (document.body.style.cursor = "default"),
                onDragStart: () => (document.body.style.cursor = "grabbing"),
                onDragEnd: () => (document.body.style.cursor = "default"),
              };
              return p.team === "offense" ? (
                <OffenseO key={p.id} x={p.x} y={p.y} number={p.number} {...handlers} />
              ) : (
                <DefenseX key={p.id} x={p.x} y={p.y} number={p.number} {...handlers} />
              );
            })}

            {cones.map((c) => {
              const radius = 18;
              const handlers = {
                draggable: true,
                onDragMove: (e: any) => {
                  const { x, y } = boundToCanvas(e.target.x(), e.target.y(), radius);
                  setCones((prev) => prev.map((cc) => (cc.id === c.id ? { ...cc, x, y } : cc)));
                },
                onMouseEnter: () => (document.body.style.cursor = "grab"),
                onMouseLeave: () => (document.body.style.cursor = "default"),
                onDragStart: () => (document.body.style.cursor = "grabbing"),
                onDragEnd: () => (document.body.style.cursor = "default"),
              };
              return <ConeToken key={c.id} x={c.x} y={c.y} {...handlers} />;
            })}
          </Layer>
        </Stage>
      </div>

      {/* Right: Toolbox */}
      <aside
        style={{
          width: 280,
          height: STAGE_HEIGHT,
          padding: 12,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          background: "#ffffff",
          overflowY: "auto",
        }}
      >
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

        <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

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

        <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

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
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block" }}>
                <path d="M12 3 L19 20 H5 Z" fill="#f97316" stroke="#b45309" strokeWidth={1.5} />
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
