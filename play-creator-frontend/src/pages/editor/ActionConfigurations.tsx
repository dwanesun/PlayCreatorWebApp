import { DribblePath, type DribbleModel } from "../../components/actions/DribblePath.tsx";
import { CutPath, type CutModel } from "../../components/actions/CutPath.tsx";
import { PassPath, type PassModel } from "../../components/actions/PassPath.tsx";
import type { PlayerToken } from "../../components/tokens/PlayerToken.ts";

// Action type union
export type ActionType = "dribble" | "cut" | "pass";
export type ActionModel = DribbleModel | CutModel | PassModel;

// Configuration for each action type
export interface ActionConfig<T extends ActionModel> {
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
export const ACTION_CONFIGS: Record<ActionType, ActionConfig<any>> = {
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
