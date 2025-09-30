import { ActionPath, type BaseActionModel, type PlayerRef, type Point, type LineStyle } from "./ActionPath";

// Pass model extends a base action model
export type PassModel = BaseActionModel;

// Configuration constants for pass path appearance
const PASS_DASH_LENGTH = 15; // Length of each dash in pixels
const PASS_GAP_LENGTH = 10;   // Length of gap between dashes in pixels

// Pass-specific line style (dashed line)
const PASS_LINE_STYLE: LineStyle = {
    type: "dashed",
    dash: [PASS_DASH_LENGTH, PASS_GAP_LENGTH],
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