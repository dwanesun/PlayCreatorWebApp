import { ActionPath, type BaseActionModel, type PlayerRef, type Point, type LineStyle } from "./ActionPath";

// Screen-specific configuration
const SCREEN_CONFIG = {
  BAR_LENGTH: 20, // Length of the perpendicular bar at the end in pixels
};

// Screen model extends a base action model
export type ScreenModel = BaseActionModel;

// Screen-specific line style (solid, like cut)
const SCREEN_LINE_STYLE: LineStyle = {
    type: "solid",
};

// Screen component - solid curved line with a perpendicular bar at the end
export function ScreenPath(props: {
    model: ScreenModel;
    offensePlayers: PlayerRef[];
    onChange: (next: ScreenModel) => void;
    toWorld: (clientX: number, clientY: number) => Point;
}) {
    return (
        <ActionPath
            {...props}
            lineStyle={SCREEN_LINE_STYLE}
            endMarker="bar"
            barLength={SCREEN_CONFIG.BAR_LENGTH}
        />
    );
}

// Re-export types for convenience
export type { Point, PlayerRef };
