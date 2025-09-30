import { useMemo } from "react";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../components/geometry/CourtGeometryUtils";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function useCanvasUtils() {
  const boundToCanvas = useMemo(
    () => (x: number, y: number, radius = 20) => ({
      x: clamp(x, radius, STAGE_WIDTH - radius),
      y: clamp(y, radius, STAGE_HEIGHT - radius),
    }),
    []
  );

  const toWorld = (
    stageRef: any,
    clientX: number,
    clientY: number
  ): { x: number; y: number } => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.container().getBoundingClientRect();
    const s = stage.scaleX() || 1;
    return { x: (clientX - rect.left) / s, y: (clientY - rect.top) / s };
  };

  return { boundToCanvas, toWorld };
}
