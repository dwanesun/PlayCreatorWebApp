import React, { useMemo } from "react";
import { Stage, Rect, Layer } from "react-konva";
import { HalfCourt } from "../../components/court/HalfCourt.tsx";
import { OffensivePlayer } from "../../components/tokens/OffensivePlayer.tsx";
import { DefensivePlayer } from "../../components/tokens/DefensivePlayer.tsx";
import { Cone } from "../../components/tokens/Cone.tsx";
import type { PlayerToken } from "../../components/tokens/PlayerToken.ts";
import type { ConeToken } from "../../components/tokens/ConeToken.ts";
import { ACTION_CONFIGS } from "./ActionConfigurations.tsx";
import type { ActionType, ActionModel } from "./ActionConfigurations.tsx";
import type { DribbleModel } from "../../components/actions/DribblePath.tsx";
import type { CutModel } from "../../components/actions/CutPath.tsx";
import type { PassModel } from "../../components/actions/PassPath.tsx";
import {
  STAGE_WIDTH,
  STAGE_HEIGHT,
} from "../../components/geometry/CourtGeometryUtils";

interface CanvasProps {
  stageRef: React.RefObject<any>;
  centerRef: React.RefObject<any>;
  scale: number;
  players: PlayerToken[];
  cones: ConeToken[];
  actions: {
    dribble: DribbleModel[];
    cut: CutModel[];
    pass: PassModel[];
  };
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string) => void;
  onUpdatePlayer: (id: string, x: number, y: number) => void;
  onUpdateCone: (id: string, x: number, y: number) => void;
  onUpdateAction: <T extends ActionModel>(
    type: ActionType,
    id: string,
    updater: (m: T) => T
  ) => void;
  toWorld: (clientX: number, clientY: number) => { x: number; y: number };
  boundToCanvas: (x: number, y: number, radius?: number) => { x: number; y: number };
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export function Canvas({
  stageRef,
  centerRef,
  scale,
  players,
  cones,
  actions,
  onSelectPlayer,
  onUpdatePlayer,
  onUpdateCone,
  onUpdateAction,
  toWorld,
  boundToCanvas,
  onDragOver,
  onDrop,
}: CanvasProps) {
  const offensePlayers = useMemo(
    () => players.filter((p) => p.team === "offense"),
    [players]
  );

  return (
    <div
      ref={centerRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
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
                  onChange={(next) => onUpdateAction(type as ActionType, action.id, () => next)}
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
              onClick: () => onSelectPlayer(p.id),
              onDragMove: (e: any) => {
                const stage = e.target.getStage();
                const s = stage?.scaleX() ?? 1;
                const { x, y } = boundToCanvas(e.target.x() / s, e.target.y() / s, radius);
                onUpdatePlayer(p.id, x, y);
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
                onUpdateCone(c.id, x, y);
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
  );
}
