import React, { useMemo, useRef, useState, useEffect } from "react";
import { Stage, Rect, Layer } from "react-konva";
import { HalfCourt } from "../components/court/HalfCourt.tsx";
import { OffensivePlayer } from "../components/tokens/OffensivePlayer.tsx";
import { DefensivePlayer } from "../components/tokens/DefensivePlayer.tsx";
import { Cone } from "../components/tokens/Cone.tsx";
import type { PlayerToken } from "../components/tokens/PlayerToken.ts";
import type { ConeToken } from "../components/tokens/ConeToken.ts";
import { DribblePath, type DribbleModel } from "../components/actions/DribblePath.tsx";
import { CutPath, type CutModel } from "../components/actions/CutPath.tsx";
import { PassPath, type PassModel } from "../components/actions/PassPath.tsx";
import type { BaseActionModel } from "../components/actions/ActionPath.tsx";
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

// Action type union
type ActionType = "dribble" | "cut" | "pass";
type ActionModel = DribbleModel | CutModel | PassModel;

// Configuration for each action type
interface ActionConfig<T extends ActionModel> {
  type: ActionType;
  Component: React.ComponentType<{
    model: T;
    offensePlayers: PlayerToken[];
    toWorld: (clientX: number, clientY: number) => { x: number; y: number };
    onChange: (next: T) => void;
  }>;
  idPrefix: string;
  label: string;
  title: string;
}

// Action configurations registry
const ACTION_CONFIGS: Record<ActionType, ActionConfig<any>> = {
  dribble: {
    type: "dribble",
    Component: DribblePath,
    idPrefix: "drb",
    label: "Dribble",
    title: "Dribble (start attaches to selected offense player if any)",
  },
  cut: {
    type: "cut",
    Component: CutPath,
    idPrefix: "cut",
    label: "Cut",
    title: "Cut (start attaches to selected offense player if any)",
  },
  pass: {
    type: "pass",
    Component: PassPath,
    idPrefix: "pass",
    label: "Pass",
    title: "Pass (start attaches to selected offense player if any)",
  },
};

export default function EditorMode() {
  const [players, setPlayers] = useState<PlayerToken[]>([]);
  const [cones, setCones] = useState<ConeToken[]>([]);
  const nextId = useRef(1);

  // Responsive scaling + collapsing left panel
  const containerRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<any>(null);

  // Selection and tools
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [tool, setTool] = useState<"none" | ActionType>("none");

  // Actions - unified state management
  const [actions, setActions] = useState<{
    dribble: DribbleModel[];
    cut: CutModel[];
    pass: PassModel[];
  }>({
    dribble: [],
    cut: [],
    pass: [],
  });

  const [scale, setScale] = useState(1);
  const [leftVisible, setLeftVisible] = useState(true);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const container = containerRef.current;
      const center = centerRef.current;
      if (!container || !center) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const leftWidth = 260;
      const rightWidth = 280;
      const gap = 24;

      const gapsWhenBoth = 2 * gap;
      const availableCenterWidthWithLeft =
        containerWidth - rightWidth - gapsWhenBoth - leftWidth;

      const availableCenterWidthNoLeft =
        containerWidth - rightWidth - gap;

      const maxScale = 1;
      const minScale = 0.75;
      const availableHeight = Math.max(containerHeight, 200);

      const scaleFor = (w: number) => {
        const sW = w / STAGE_WIDTH;
        const sH = availableHeight / STAGE_HEIGHT;
        return Math.min(Math.max(minScale, Math.min(sW, sH)), maxScale);
      };

      let nextLeftVisible = true;
      let s = scaleFor(availableCenterWidthWithLeft);

      if (availableCenterWidthWithLeft <= 0 || s < 0.9) {
        nextLeftVisible = false;
        s = scaleFor(availableCenterWidthNoLeft);
      }

      setLeftVisible(nextLeftVisible);
      setScale(s);
    });

    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Convert client to world coordinates
  const toWorld = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.container().getBoundingClientRect();
    const s = stage.scaleX() || 1;
    return { x: (clientX - rect.left) / s, y: (clientY - rect.top) / s };
  };

  // Generic action creation helper
  const createActionModel = <T extends BaseActionModel>(
    type: ActionType,
    idPrefix: string
  ): T => {
    const selected = players.find((p) => p.id === selectedPlayerId && p.team === "offense");
    const startPoint = selected
      ? { x: selected.x, y: selected.y }
      : { x: COURT_X + COURT_WIDTH * 0.35, y: COURT_Y + COURT_HEIGHT * 0.45 };
    const endPoint = { x: startPoint.x + 120, y: startPoint.y - 40 };

    return {
      id: `${idPrefix}-${nextId.current++}`,
      start: selected
        ? { kind: "player", playerId: selected.id }
        : { kind: "free", point: startPoint },
      end: endPoint,
      mid: { t: 0.5, offset: 0 },
    } as T;
  };

  // Generic action add handler
  const addAction = (type: ActionType) => {
    const config = ACTION_CONFIGS[type];
    const model = createActionModel(type, config.idPrefix);
    setActions((prev) => ({
      ...prev,
      [type]: [...prev[type], model],
    }));
    setTool(type);
  };

  // Generic action update handler
  const updateAction = <T extends ActionModel>(
    type: ActionType,
    id: string,
    updater: (m: T) => T
  ) => {
    setActions((prev) => ({
      ...prev,
      [type]: prev[type].map((action) => (action.id === id ? updater(action as T) : action)),
    }));
  };

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

  // Drag & drop support
  type DragToken =
    | { kind: "player"; team: "offense" | "defense"; number: 1 | 2 | 3 | 4 | 5 }
    | { kind: "cone" };

  const startDrag = (e: React.DragEvent, data: DragToken) => {
    e.dataTransfer.setData("application/x-token", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/x-token");
    if (!raw) return;
    let data: DragToken | null = null;
    try {
      data = JSON.parse(raw) as DragToken;
    } catch {
      return;
    }
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.container().getBoundingClientRect();
    const localX = (e.clientX - rect.left) / scale;
    const localY = (e.clientY - rect.top) / scale;

    if (data.kind === "cone") {
      const radius = 18;
      const { x, y } = boundToCanvas(localX, localY, radius);
      setCones((prev) => [...prev, { id: `cone-${nextId.current++}`, x, y }]);
      return;
    }

    if (data.kind === "player") {
      const radius = 20;
      const { x, y } = boundToCanvas(localX, localY, radius);
      const { team, number } = data;
      setPlayers((prev) => [
        ...prev,
        { id: `${team}-${number}-${nextId.current++}`, team, number, x, y },
      ]);
    }
  };

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

  const offensePlayers = useMemo(
    () => players.filter((p) => p.team === "offense"),
    [players]
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
        padding: 24,
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
        background: "#fff",
      }}
    >
      {/* Left: Phases placeholder */}
      <aside
        style={{
          width: 260,
          height: Math.round(STAGE_HEIGHT * scale),
          padding: 12,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          background: "#ffffff",
          display: leftVisible ? "flex" : "none",
          flexDirection: "column",
          gap: 12,
          flexShrink: 0,
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
      <div
        ref={centerRef}
        onDragOver={handleCanvasDragOver}
        onDrop={handleCanvasDrop}
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          height: Math.round(STAGE_HEIGHT * scale),
        }}
      >
        <Stage
          ref={stageRef}
          width={STAGE_WIDTH * scale}
          height={STAGE_HEIGHT * scale}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            <Rect x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="#ffffff" />
          </Layer>

          <Layer>
            <Rect
              x={0.5}
              y={0.5}
              width={STAGE_WIDTH - 1}
              height={STAGE_HEIGHT - 1}
              stroke="#94a3b8"
              strokeWidth={2}
              cornerRadius={8}
            />
          </Layer>

          <HalfCourt />

          {/* Render all action layers dynamically */}
          {Object.entries(ACTION_CONFIGS).map(([type, config]) => (
            <Layer key={type}>
              {actions[type as ActionType].map((action) => {
                const Component = config.Component;
                return (
                  <Component
                    key={action.id}
                    model={action}
                    offensePlayers={offensePlayers}
                    toWorld={toWorld}
                    onChange={(next) =>
                      updateAction(type as ActionType, action.id, () => next)
                    }
                  />
                );
              })}
            </Layer>
          ))}

          {/* Players Layer */}
          <Layer>
            {players.map((p) => {
              const radius = 20;
              const handlers = {
                draggable: true,
                onClick: () => setSelectedPlayerId(p.id),
                onDragMove: (e: any) => {
                  const stage = e.target.getStage();
                  const s = stage?.scaleX() ?? 1;
                  const { x, y } = boundToCanvas(e.target.x() / s, e.target.y() / s, radius);
                  setPlayers((prev) => prev.map((pp) => (pp.id === p.id ? { ...pp, x, y } : pp)));
                },
                onMouseEnter: () => (document.body.style.cursor = "grab"),
                onMouseLeave: () => (document.body.style.cursor = "default"),
                onDragStart: () => (document.body.style.cursor = "grabbing"),
                onDragEnd: () => (document.body.style.cursor = "default"),
              };
              return p.team === "offense" ? (
                <OffensivePlayer key={p.id} x={p.x} y={p.y} number={p.number} {...handlers} />
              ) : (
                <DefensivePlayer key={p.id} x={p.x} y={p.y} number={p.number} {...handlers} />
              );
            })}

            {cones.map((c) => {
              const radius = 18;
              const handlers = {
                draggable: true,
                onDragMove: (e: any) => {
                  const stage = e.target.getStage();
                  const s = stage?.scaleX() ?? 1;
                  const { x, y } = boundToCanvas(e.target.x() / s, e.target.y() / s, radius);
                  setCones((prev) => prev.map((cc) => (cc.id === c.id ? { ...cc, x, y } : cc)));
                },
                onMouseEnter: () => (document.body.style.cursor = "grab"),
                onMouseLeave: () => (document.body.style.cursor = "default"),
                onDragStart: () => (document.body.style.cursor = "grabbing"),
                onDragEnd: () => (document.body.style.cursor = "default"),
              };
              return <Cone key={c.id} x={c.x} y={c.y} {...handlers} />;
            })}
          </Layer>
        </Stage>
      </div>

      {/* Right: Toolbox */}
      <aside
        style={{
          width: 280,
          height: Math.round(STAGE_HEIGHT * scale),
          padding: 12,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          background: "#ffffff",
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <section>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Add Actions</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {/* Dynamically render action buttons from config */}
            {Object.values(ACTION_CONFIGS).map((config) => (
              <button
                key={config.type}
                onClick={() => addAction(config.type)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: tool === config.type ? "2px solid #0f172a" : "1px solid #0f172a",
                  background: "#ffffff",
                  color: "#0f172a",
                  cursor: "pointer",
                  fontWeight: tool === config.type ? "bold" : "normal",
                }}
                title={config.title}
              >
                {config.label}
              </button>
            ))}

            {/* Disabled actions for future implementation */}
            {["Screen", "Shot", "Handoff"].map((label) => (
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
                  draggable
                  onDragStart={(e) =>
                    startDrag(e, { kind: "player", team: "offense", number: n as 1 | 2 | 3 | 4 | 5 })
                  }
                  onClick={() => addPlayer("offense", n as 1 | 2 | 3 | 4 | 5)}
                  style={{
                    padding: "6px 0",
                    borderRadius: 6,
                    border: "1px solid #0f172a",
                    background: "#ffffff",
                    color: "#0f172a",
                    cursor: "grab",
                  }}
                  title={`Add/Drag Offense ${n}`}
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
                  draggable
                  onDragStart={(e) =>
                    startDrag(e, { kind: "player", team: "defense", number: n as 1 | 2 | 3 | 4 | 5 })
                  }
                  onClick={() => addPlayer("defense", n as 1 | 2 | 3 | 4 | 5)}
                  style={{
                    padding: "6px 0",
                    borderRadius: 6,
                    border: "1px solid #c0392b",
                    background: "#fdecea",
                    color: "#972c23",
                    cursor: "grab",
                  }}
                  title={`Add/Drag Defense ${n}`}
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
              draggable
              onDragStart={(e) => startDrag(e, { kind: "cone" })}
              onClick={addCone}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #fb923c",
                background: "#fff7ed",
                color: "#c2410c",
                cursor: "grab",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              title="Add/Drag Cone"
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
