import { Group, Circle, Line, Arrow } from "react-konva";

export type Point = { x: number; y: number };

export type DribbleModel = {
  id: string;
  start:
    | { kind: "player"; playerId: string }
    | { kind: "free"; point: Point };
  end: Point;
  // Midpoint controller stored as a parametric slider and an offset from the straight line
  mid: { t: number; offset: number };
};

export type PlayerRef = { id: string; team: "offense" | "defense"; x: number; y: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function dist2(a: Point, b: Point) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function projectParamT(p: Point, a: Point, b: Point) {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const wx = p.x - a.x;
  const wy = p.y - a.y;
  const denom = vx * vx + vy * vy || 1;
  return clamp((vx * wx + vy * wy) / denom, 0, 1);
}

function signedOffsetFromLine(p: Point, a: Point, b: Point) {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const wx = p.x - a.x;
  const wy = p.y - a.y;
  // 2D cross gives signed area; normalize by |v| for a signed distance-esque value
  const len = Math.hypot(vx, vy) || 1;
  return (vx * wy - vy * wx) / len;
}

function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// Make a squiggly polyline between start and end.
// Peak curvature is centered at mid.t with amplitude ~ mid.offset using a smooth bell weight.
function buildDribblePolyline(start: Point, end: Point, mid: { t: number; offset: number }): number[] {
  const N = 40; // segments
  const vx = end.x - start.x;
  const vy = end.y - start.y;
  const len = Math.hypot(vx, vy) || 1;
  const nx = -vy / len; // left normal
  const ny = vx / len;

  // Frequency roughly scales with length; keep readable
  const waves = Math.max(1, Math.floor(len / 120));
  const freq = Math.PI * 2 * waves;

  // Gaussian weight centered at mid.t to localize squiggle emphasis
  const sigma = 0.18;
  const gaussian = (t: number) => Math.exp(-0.5 * Math.pow((t - mid.t) / sigma, 2));

  const amp = clamp(Math.abs(mid.offset), 0, 50); // cap amplitude for readability
  const sign = Math.sign(mid.offset) || 1;

  const pts: number[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const base = lerp(start, end, t);
    const localAmp = amp * gaussian(t);
    const s = Math.sin(t * freq) * localAmp * sign;
    pts.push(base.x + nx * s, base.y + ny * s);
  }
  return pts;
}

export function DribblePath(props: {
  model: DribbleModel;
  offensePlayers: PlayerRef[];
  onChange: (next: DribbleModel) => void;
  toWorld: (clientX: number, clientY: number) => Point;
}) {
  const { model, offensePlayers, onChange, toWorld } = props;

  let startPoint: Point;
  if (model.start.kind === "player") {
    const pid = model.start.playerId;
    const p = offensePlayers.find((pp) => pp.id === pid);
    startPoint = p ? { x: p.x, y: p.y } : { x: 0, y: 0 };
  } else {
    startPoint = model.start.point;
  }

  const endPoint = model.end;
  const poly = buildDribblePolyline(startPoint, endPoint, model.mid);

  const onStartDragMove = (evt: any) => {
    const { x, y } = toWorld(evt.evt.clientX, evt.evt.clientY);
    const snapR2 = 28 * 28;
    let best: PlayerRef | null = null;
    let bestD2 = Infinity;
    for (const p of offensePlayers) {
      const dx = x - p.x;
      const dy = y - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) {
        best = p;
        bestD2 = d2;
      }
    }
    if (best && bestD2 <= snapR2) {
      onChange({ ...model, start: { kind: "player", playerId: best.id } });
    } else {
      onChange({ ...model, start: { kind: "free", point: { x, y } } });
    }
  };

  const onEndDragMove = (evt: any) => {
    const { x, y } = toWorld(evt.evt.clientX, evt.evt.clientY);
    onChange({ ...model, end: { x, y } });
  };

  const onMidDragMove = (evt: any) => {
    const { x, y } = toWorld(evt.evt.clientX, evt.evt.clientY);
    const vx = endPoint.x - startPoint.x;
    const vy = endPoint.y - startPoint.y;
    const len2 = vx * vx + vy * vy || 1;
    const t = Math.max(0, Math.min(1, ((x - startPoint.x) * vx + (y - startPoint.y) * vy) / len2));
    const len = Math.sqrt(len2);
    const nx = -vy / (len || 1);
    const ny = vx / (len || 1);
    const along = { x: startPoint.x + vx * t, y: startPoint.y + vy * t };
    const offset = Math.max(-80, Math.min(80, (x - along.x) * nx + (y - along.y) * ny));
    onChange({ ...model, mid: { t, offset } });
  };

  const rStart = 8;
  const rMid = 7;
  const rEnd = 9;

  // Return a Group (NOT a Layer) so it can be placed inside an existing Layer
  return (
    <Group>
      <Line points={poly} stroke="#0f172a" strokeWidth={3} listening={false} />
      {poly.length >= 4 && (
        <Arrow
          points={[poly[poly.length - 4], poly[poly.length - 3], poly[poly.length - 2], poly[poly.length - 1]]}
          pointerLength={12}
          pointerWidth={12}
          fill="#0f172a"
          stroke="#0f172a"
          strokeWidth={3}
          listening={false}
        />
      )}
      <Circle
        x={startPoint.x}
        y={startPoint.y}
        radius={rStart}
        fill="#22c55e"
        stroke="#14532d"
        strokeWidth={2}
        draggable
        onDragMove={onStartDragMove}
        onMouseEnter={() => (document.body.style.cursor = "grab")}
        onMouseLeave={() => (document.body.style.cursor = "default")}
        onDragStart={() => (document.body.style.cursor = "grabbing")}
        onDragEnd={() => (document.body.style.cursor = "default")}
      />
      {(() => {
        const vx = endPoint.x - startPoint.x;
        const vy = endPoint.y - startPoint.y;
        const len = Math.hypot(vx, vy) || 1;
        const nx = -vy / len;
        const ny = vx / len;
        const mx = startPoint.x + vx * model.mid.t + nx * model.mid.offset;
        const my = startPoint.y + vy * model.mid.t + ny * model.mid.offset;
        return (
          <Circle
            x={mx}
            y={my}
            radius={rMid}
            fill="#f59e0b"
            stroke="#7c2d12"
            strokeWidth={2}
            draggable
            onDragMove={onMidDragMove}
            onMouseEnter={() => (document.body.style.cursor = "grab")}
            onMouseLeave={() => (document.body.style.cursor = "default")}
            onDragStart={() => (document.body.style.cursor = "grabbing")}
            onDragEnd={() => (document.body.style.cursor = "default")}
          />
        );
      })()}
      <Circle
        x={endPoint.x}
        y={endPoint.y}
        radius={rEnd}
        fill="#3b82f6"
        stroke="#1e3a8a"
        strokeWidth={2}
        draggable
        onDragMove={onEndDragMove}
        onMouseEnter={() => (document.body.style.cursor = "grab")}
        onMouseLeave={() => (document.body.style.cursor = "default")}
        onDragStart={() => (document.body.style.cursor = "grabbing")}
        onDragEnd={() => (document.body.style.cursor = "default")}
      />
    </Group>
  );
}
