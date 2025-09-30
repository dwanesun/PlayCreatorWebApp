import { useRef, useState, useCallback } from "react";
import type { PlayerToken } from "../../components/tokens/PlayerToken.ts";
import type { BaseActionModel } from "../../components/actions/ActionPath.tsx";
import type { DribbleModel } from "../../components/actions/DribblePath.tsx";
import type { CutModel } from "../../components/actions/CutPath.tsx";
import type { PassModel } from "../../components/actions/PassPath.tsx";
import type { ActionType, ActionModel } from "./ActionConfigurations.tsx";
import { ACTION_CONFIGS } from "./ActionConfigurations.tsx";
import {
  COURT_WIDTH,
  COURT_HEIGHT,
  COURT_X,
  COURT_Y,
} from "../../components/geometry/CourtGeometryUtils";

export function useActionManagement(
  players: PlayerToken[],
  selectedPlayerId: string | null
) {
  const nextId = useRef(1);
  const [tool, setTool] = useState<"none" | ActionType>("none");

  const [actions, setActions] = useState<{
    dribble: DribbleModel[];
    cut: CutModel[];
    pass: PassModel[];
  }>({
    dribble: [],
    cut: [],
    pass: [],
  });

  // Generic action creation helper
  const createActionModel = useCallback(
    <T extends BaseActionModel>(type: ActionType, idPrefix: string): T => {
      const selected = players.find(
        (p) => p.id === selectedPlayerId && p.team === "offense"
      );
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
    },
    [players, selectedPlayerId]
  );

  // Generic action add handler
  const addAction = useCallback(
    (type: ActionType) => {
      const config = ACTION_CONFIGS[type];
      const model = createActionModel(type, config.idPrefix);
      setActions((prev) => ({
        ...prev,
        [type]: [...prev[type], model],
      }));
      setTool(type);
    },
    [createActionModel]
  );

  // Generic action update handler
  const updateAction = useCallback(
    <T extends ActionModel>(type: ActionType, id: string, updater: (m: T) => T) => {
      setActions((prev) => ({
        ...prev,
        [type]: prev[type].map((action) =>
          action.id === id ? updater(action as T) : action
        ),
      }));
    },
    []
  );

  return {
    actions,
    tool,
    addAction,
    updateAction,
  };
}
