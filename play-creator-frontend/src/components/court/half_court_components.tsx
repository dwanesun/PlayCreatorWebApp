import { Layer, Rect, Line, Circle, Arc, Group } from "react-konva";
import {
    COURT_X, COURT_Y, COURT_WIDTH, COURT_HEIGHT,
    leftSidelineX, rightSidelineX, baselineY, halfCourtY, centerX,
    backboardX, backboardY, backboardW, hoopY, hoopR,
    laneLeftX, laneRightX, laneBottomY,
    ftLineY, ftCircleR, threeR,
} from "../geometry/CourtGeometryUtils";

export function CourtHalf() {
    // Vertical planks with consistent size, staggered like brickwork:
    // - All planks same width and length
    // - Adjacent columns offset by half a plank length
    // - Each plank uses a different shade from the palette
    const plankWidth = 14;     // px: board width across x-axis (column width)
    const plankLength = 110;   // px: board length along y-axis
    const startX = COURT_X;
    const endX = COURT_X + COURT_WIDTH;
    const startY = COURT_Y;
    const endY = COURT_Y + COURT_HEIGHT;

    // Palette of wood shades
    const woodShades = [
        "#f7d7a6", "#f3cc93", "#efc384", "#eaba77",
        "#e6b16a", "#e1a85e", "#dda052", "#d79745",
        "#f0cda0", "#e7bb80",
    ];

    // Deterministic shade per (column,row) for pleasing variety
    const pickShade = (col: number, rowIndex: number) =>
        woodShades[(col * 7 + rowIndex * 5) % woodShades.length];

    // Slight per-plank gradient to simulate grain/light
    const gradientStops = (depth = 0.06) => [
        0, "rgba(0,0,0,0)",
        0.5, `rgba(0,0,0,${depth})`,
        1, "rgba(0,0,0,0)",
    ];

    return (
        <Layer>
            {/* Court outline (stroke only) */}
            <Rect
                x={COURT_X}
                y={COURT_Y}
                width={COURT_WIDTH}
                height={COURT_HEIGHT}
                stroke="#1f2937"
                strokeWidth={2}
                cornerRadius={4}
            />

            {/* Wood flooring clipped to court area */}
            <Group clip={{ x: COURT_X, y: COURT_Y, width: COURT_WIDTH, height: COURT_HEIGHT }}>
                {/* Base tone */}
                <Rect x={COURT_X} y={COURT_Y} width={COURT_WIDTH} height={COURT_HEIGHT} fill="#f3cc93" />

                {/* Columns of vertical planks; every other column starts half a plank lower */}
                {Array.from({ length: Math.ceil(COURT_WIDTH / plankWidth) }).map((_, col) => {
                    const x = startX + col * plankWidth;
                    const width = Math.min(plankWidth, endX - x);
                    if (width <= 0) return null;

                    // Stagger: odd columns start at half plank length
                    const startOffset = (col % 2 === 1) ? plankLength / 2 : 0;

                    const rects: JSX.Element[] = [];
                    for (let rectY = startY + startOffset, rowIndex = 0; rectY < endY; rowIndex++, rectY += plankLength) {
                        const height = Math.min(plankLength, endY - rectY);
                        if (height <= 0) continue;

                        const shade = pickShade(col, rowIndex);
                        const gradDepth = 0.05 + ((col + rowIndex) % 4) * 0.01; // subtle variation

                        rects.push(
                            <Rect
                                key={`vplank-c${col}-r${rowIndex}`}
                                x={x}
                                y={rectY}
                                width={width}
                                height={height}
                                fill={shade}
                                opacity={0.98}
                                // vertical plank with a faint horizontal gradient for depth
                                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                                fillLinearGradientEndPoint={{ x: width, y: 0 }}
                                fillLinearGradientColorStops={gradientStops(gradDepth)}
                            />
                        );
                    }

                    // Hairline seam at column boundary to accentuate plank columns
                    return (
                        <Group key={`col-${col}`}>
                            {rects}
                            <Rect
                                x={x - 0.5}
                                y={startY}
                                width={1}
                                height={COURT_HEIGHT}
                                fill="rgba(0,0,0,0.06)"
                            />
                        </Group>
                    );
                })}
            </Group>

            {/* Baseline, sidelines, half-court line */}
            <Line points={[leftSidelineX, baselineY, rightSidelineX, baselineY]} stroke="#1f2937" strokeWidth={2} />
            <Line points={[leftSidelineX, baselineY, leftSidelineX, halfCourtY]} stroke="#1f2937" strokeWidth={2} />
            <Line points={[rightSidelineX, baselineY, rightSidelineX, halfCourtY]} stroke="#1f2937" strokeWidth={2} />
            <Line points={[leftSidelineX, halfCourtY, rightSidelineX, halfCourtY]} stroke="#1f2937" strokeWidth={2} />

            {/* Backboard and hoop */}
            <Rect x={backboardX} y={backboardY} width={backboardW} height={2} fill="#1f2937" />
            <Circle x={centerX} y={hoopY} radius={hoopR} stroke="#1f2937" strokeWidth={2} />

            {/* Lane (key) */}
            <Rect
                x={laneLeftX}
                y={baselineY}
                width={laneRightX - laneLeftX}
                height={laneBottomY - baselineY}
                stroke="#1f2937"
                strokeWidth={2}
            />

            {/* Free-throw line and circle (upper solid, lower dashed) */}
            <Line points={[laneLeftX, ftLineY, laneRightX, ftLineY]} stroke="#1f2937" strokeWidth={2} />
            <Arc x={centerX} y={ftLineY} innerRadius={ftCircleR} outerRadius={ftCircleR} angle={180} rotation={180} stroke="#1f2937" strokeWidth={2} />
            <Arc x={centerX} y={ftLineY} innerRadius={ftCircleR} outerRadius={ftCircleR} angle={180} rotation={0} stroke="#1f2937" strokeWidth={2} dash={[6, 6]} />

            {/* HS three-point arc (semicircle) and straight extensions to baseline */}
            <Arc x={centerX} y={hoopY} innerRadius={threeR} outerRadius={threeR} angle={180} rotation={0} stroke="#1f2937" strokeWidth={2} />
            <Line points={[centerX - threeR, hoopY, centerX - threeR, baselineY]} stroke="#1f2937" strokeWidth={2} />
            <Line points={[centerX + threeR, hoopY, centerX + threeR, baselineY]} stroke="#1f2937" strokeWidth={2} />
        </Layer>
    );
}