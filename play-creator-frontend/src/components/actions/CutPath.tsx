import { ActionPath, type BaseActionModel, type PlayerRef, type Point, type LineStyle } from "./ActionPath";

// Cut model extends a base action model
export type CutModel = BaseActionModel;

// Cut-specific line style (solid, no squiggles)
const CUT_LINE_STYLE: LineStyle = {
    type: "solid",
};

// Cut component - solid curved line with arrow
export function CutPath(props: {
    model: CutModel;
    offensePlayers: PlayerRef[];
    onChange: (next: CutModel) => void;
    toWorld: (clientX: number, clientY: number) => Point;
}) {
    return (
        <ActionPath
            {...props}
            lineStyle={CUT_LINE_STYLE}
            endMarker="arrow"
        />
    );
}

// Re-export types for convenience
export type { Point, PlayerRef };
