import { ActionPath, type BaseActionModel, type PlayerRef, type Point, type LineStyle } from "./ActionPath";

// Pass model extends a base action model
export type PassModel = BaseActionModel;

// Pass-specific line style (dashed line)
const PASS_LINE_STYLE: LineStyle = {
    type: "dashed",
    dash: [10, 5], // 10px dash, 5px gap
};

// Pass component - dashed curved line with arrow
export function PassPath(props: {
    model: PassModel;
    offensePlayers: PlayerRef[];
    onChange: (next: PassModel) => void;
    toWorld: (clientX: number, clientY: number) => Point;
}) {
    return (
        <ActionPath
            {...props}
            lineStyle={PASS_LINE_STYLE}
            endMarker="arrow"
        />
    );
}

// Re-export types for convenience
export type { Point, PlayerRef };