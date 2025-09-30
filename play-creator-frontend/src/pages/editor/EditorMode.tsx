import { useMemo, useRef, useState } from "react";
import type { PlayerToken } from "../../components/tokens/PlayerToken.ts";
import type { ConeToken } from "../../components/tokens/ConeToken.ts";
import { Canvas } from "./CanvasComponent.tsx";
import { Toolbox } from "./ToolboxComponent.tsx";
import { useResponsiveScale } from "./ResponsiveScaleHook.tsx";
import { useCanvasUtils } from "./CanvasUtilities.tsx";
import { useActionManagement } from "./ActionManagementHook.tsx";
import { useDragDrop } from "./DragDropUtility.tsx";
import {
    STAGE_HEIGHT,
    COURT_WIDTH,
    COURT_HEIGHT,
    COURT_X,
    COURT_Y,
} from "../../components/geometry/CourtGeometryUtils.ts";

export default function EditorMode() {
    const [players, setPlayers] = useState<PlayerToken[]>([]);
    const [cones, setCones] = useState<ConeToken[]>([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const nextId = useRef(1);

    const centerRef = useRef<HTMLDivElement | null>(null);
    const stageRef = useRef<any>(null);

    // Custom hooks
    const { containerRef, scale, leftVisible } = useResponsiveScale();
    const { boundToCanvas, toWorld: toWorldFn } = useCanvasUtils();
    const { actions, tool, addAction, updateAction } = useActionManagement(
        players,
        selectedPlayerId
    );

    const toWorld = (clientX: number, clientY: number) => toWorldFn(stageRef, clientX, clientY);

    const { startDrag, handleCanvasDragOver, handleCanvasDrop } = useDragDrop(
        stageRef,
        scale,
        boundToCanvas,
        nextId,
        setPlayers,
        setCones
    );

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

    const updatePlayer = (id: string, x: number, y: number) => {
        setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
    };

    const updateCone = (id: string, x: number, y: number) => {
        setCones((prev) => prev.map((c) => (c.id === id ? { ...c, x, y } : c)));
    };

    return (
        <div
            ref={containerRef}
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
                <div style={{ color: "#64748b", fontSize: 12 }}>
                    Phase timeline and controls coming soon…
                </div>
            </aside>

            {/* Center: Canvas */}
            <Canvas
                stageRef={stageRef}
                centerRef={centerRef}
                scale={scale}
                players={players}
                cones={cones}
                actions={actions}
                selectedPlayerId={selectedPlayerId}
                onSelectPlayer={setSelectedPlayerId}
                onUpdatePlayer={updatePlayer}
                onUpdateCone={updateCone}
                onUpdateAction={updateAction}
                toWorld={toWorld}
                boundToCanvas={boundToCanvas}
                onDragOver={handleCanvasDragOver}
                onDrop={handleCanvasDrop}
            />

            {/* Right: Toolbox */}
            <Toolbox
                scale={scale}
                tool={tool}
                onAddAction={addAction}
                onAddPlayer={addPlayer}
                onAddCone={addCone}
                onStartDrag={startDrag}
            />
        </div>
    );
}
