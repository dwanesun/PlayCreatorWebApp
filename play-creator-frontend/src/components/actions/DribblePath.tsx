import { ActionPath, type BaseActionModel, type PlayerRef, type Point, type LineStyle } from "./ActionPath.tsx";

// Dribble-specific configuration
const DRIBBLE_CONFIG = {
    SQUIGGLE_WAVELENGTH: 26,      // px between squiggle peaks
    SQUIGGLE_AMPLITUDE: 6,        // px height of squiggle wave
    SQUIGGLE_SEGMENTS_PER_WAVE: 8, // segments per wave for smoothness
};

// Dribble model extends base action model
export type DribbleModel = BaseActionModel;

// Dribble-specific line style
const DRIBBLE_LINE_STYLE: LineStyle = {
    type: "squiggle",
    wavelength: DRIBBLE_CONFIG.SQUIGGLE_WAVELENGTH,
    amplitude: DRIBBLE_CONFIG.SQUIGGLE_AMPLITUDE,
    segmentsPerWave: DRIBBLE_CONFIG.SQUIGGLE_SEGMENTS_PER_WAVE,
};

// Dribble component
export function DribblePath(props: {
    model: DribbleModel;
    offensePlayers: PlayerRef[];
    onChange: (next: DribbleModel) => void;
    toWorld: (clientX: number, clientY: number) => Point;
}) {
    return (
        <ActionPath
            {...props}
            lineStyle={DRIBBLE_LINE_STYLE}
            endMarker="arrow"
        />
    );
}

// Re-export types for convenience
export type { Point, PlayerRef };
