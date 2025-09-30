import React, { useCallback } from "react";
import type { PlayerToken } from "../../components/tokens/PlayerToken.ts";
import type { ConeToken } from "../../components/tokens/ConeToken.ts";

export type DragToken =
  | { kind: "player"; team: "offense" | "defense"; number: 1 | 2 | 3 | 4 | 5 }
  | { kind: "cone" };

export function useDragDrop(
  stageRef: React.RefObject<any>,
  scale: number,
  boundToCanvas: (x: number, y: number, radius?: number) => { x: number; y: number },
  nextId: React.MutableRefObject<number>,
  setPlayers: React.Dispatch<React.SetStateAction<PlayerToken[]>>,
  setCones: React.Dispatch<React.SetStateAction<ConeToken[]>>
) {
  const startDrag = useCallback((e: React.DragEvent, data: DragToken) => {
    e.dataTransfer.setData("application/x-token", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "copy";
  }, []);

  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/x-token");
      if (!raw) return;
      let data: DragToken | null = null;
      try {
        data = JSON.parse(raw) as DragToken;
      } catch {
        return;
      }
      const stage = stageRef.current;
      if (!stage) return;

      const rect = stage.container().getBoundingClientRect();
      const localX = (e.clientX - rect.left) / scale;
      const localY = (e.clientY - rect.top) / scale;

      if (data.kind === "cone") {
        const radius = 18;
        const { x, y } = boundToCanvas(localX, localY, radius);
        setCones((prev) => [...prev, { id: `cone-${nextId.current++}`, x, y }]);
        return;
      }

      if (data.kind === "player") {
        const radius = 20;
        const { x, y } = boundToCanvas(localX, localY, radius);
        const { team, number } = data;
        setPlayers((prev) => [
          ...prev,
          { id: `${team}-${number}-${nextId.current++}`, team, number, x, y },
        ]);
      }
    },
    [stageRef, scale, boundToCanvas, nextId, setPlayers, setCones]
  );

  return {
    startDrag,
    handleCanvasDragOver,
    handleCanvasDrop,
  };
}
