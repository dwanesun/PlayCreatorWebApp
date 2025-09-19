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

function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// Quadratic Bezier helpers for global arc control
function quadPoint(a: Point, c: Point, b: Point, t: number): Point {
  const u = 1 - t;
  // P(t) = u^2*A + 2*u*t*C + t^2*B
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
}

function quadTangent(a: Point, c: Point, b: Point, t: number): Point {
  // P'(t) = 2*(1-t)*(C-A) + 2*t*(B-C)
  const u = 1 - t;
  return {
    x: 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x),
    y: 2 * u * (c.y - a.y) + 2 * t * (b.y - c.y),
  };
}
// Build a polyline along a quadratic centerline (global arc).
// Then apply a small sinusoidal offset along the local normal to form the "squiggle".
// The squiggle spacing is ~16px between peaks, independent of the midpoint bend.
function buildDribblePolyline(start: Point, end: Point, mid: { t: number; offset: number }): number[] {
  // Control point derived from a straight line with midpoint offset along straight normal.
  const vx = end.x - start.x;
  const vy = end.y - start.y;
  const L = Math.hypot(vx, vy) || 1;
  const nx = -vy / L;
  const ny = vx / L;
  const base = lerp(start, end, mid.t);
  const control: Point = { x: base.x + nx * mid.offset, y: base.y + ny * mid.offset };

  // Squiggle configuration
  const wavelength = 16;       // px between peaks
  const waves = Math.max(1, Math.floor(L / wavelength));
  const freq = Math.PI * 2 * waves;
  const amp = 5;               // fixed small amplitude (px), keeps the line "straight but squiggly"

  const N = Math.max(24, Math.min(100, Math.floor(L / 8))); // segment density vs length

  const pts: number[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;

    // Centerline point and local normal from a quadratic curve
    const p = quadPoint(start, control, end, t);
    const tan = quadTangent(start, control, end, t);
    const tl = Math.hypot(tan.x, tan.y) || 1;
    const n = { x: -tan.y / tl, y: tan.x / tl };

    // Apply a small sinusoidal offset along the normal with fixed amplitude
    const s = Math.sin(t * freq) * amp;
    pts.push(p.x + n.x * s, p.y + n.y * s);
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

  // Now: global arc determined by midpoint; squiggle overlays but is straight by default (offset=0)
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
