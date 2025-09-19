import { Layer, Rect, Line, Circle, Arc } from "react-konva";
import {
  COURT_X, COURT_Y, COURT_WIDTH, COURT_HEIGHT,
  leftSidelineX, rightSidelineX, baselineY, halfCourtY, centerX,
  backboardX, backboardY, backboardW, hoopY, hoopR,
  laneLeftX, laneRightX, laneBottomY,
  ftLineY, ftCircleR, threeR,
} from "../geometry/CourtGeometryUtils";

export function CourtHalf() {
  return (
    <Layer>
      {/* Canvas court outline */}
      <Rect
        x={COURT_X}
        y={COURT_Y}
        width={COURT_WIDTH}
        height={COURT_HEIGHT}
        stroke="#1f2937"
        strokeWidth={2}
        cornerRadius={4}
      />

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
