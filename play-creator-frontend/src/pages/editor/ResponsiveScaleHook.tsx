import { useEffect, useState, useRef } from "react";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../components/geometry/CourtGeometryUtils";

export function useResponsiveScale() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [leftVisible, setLeftVisible] = useState(true);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const leftWidth = 260;
      const rightWidth = 280;
      const gap = 24;

      const gapsWhenBoth = 2 * gap;
      const availableCenterWidthWithLeft =
        containerWidth - rightWidth - gapsWhenBoth - leftWidth;

      const availableCenterWidthNoLeft = containerWidth - rightWidth - gap;

      const maxScale = 1;
      const minScale = 0.75;
      const availableHeight = Math.max(containerHeight, 200);

      const scaleFor = (w: number) => {
        const sW = w / STAGE_WIDTH;
        const sH = availableHeight / STAGE_HEIGHT;
        return Math.min(Math.max(minScale, Math.min(sW, sH)), maxScale);
      };

      let nextLeftVisible = true;
      let s = scaleFor(availableCenterWidthWithLeft);

      if (availableCenterWidthWithLeft <= 0 || s < 0.9) {
        nextLeftVisible = false;
        s = scaleFor(availableCenterWidthNoLeft);
      }

      setLeftVisible(nextLeftVisible);
      setScale(s);
    });

    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return { containerRef, scale, leftVisible };
}
