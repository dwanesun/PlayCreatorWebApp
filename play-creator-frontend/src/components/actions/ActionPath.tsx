import { Group, Circle, Line, Arrow } from "react-konva";
import React from "react";

// ============================================================================
// Shared Types
// ============================================================================

export type Point = { x: number; y: number };

export type ActionStart =
  | { kind: "player"; playerId: string }
  | { kind: "free"; point: Point };

export type BaseActionModel = {
  id: string;
  start: ActionStart;
  end: Point;
  mid: { t: number; offset: number };
};

export type PlayerRef = {
  id: string;
  team: "offense" | "defense";
  x: number;
  y: number;
};

// ============================================================================
// Configuration
// ============================================================================

export const ACTION_CONFIG = {
  MAX_CURVE_OFFSET: 800, // px maximum offset from a straight line
  ARROW_LENGTH: 12, // px length of arrow head
  ARROW_WIDTH: 12, // px width of arrow head
  START_HANDLE_RADIUS: 8, // px radius of a start handle
  MID_HANDLE_RADIUS: 7, // px radius of a midpoint handle
  END_HANDLE_RADIUS: 9, // px radius of an end handle
  SNAP_RADIUS: 28, // px snap distance to player
};

// ============================================================================
// Quadratic Bezier Math Utilities
// ============================================================================

export function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export function quadPoint(a: Point, c: Point, b: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
}

export function quadTangent(a: Point, c: Point, b: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x),
    y: 2 * u * (c.y - a.y) + 2 * t * (b.y - c.y),
  };
}

export function getControlPoint(
  start: Point,
  end: Point,
  mid: { t: number; offset: number }
): Point {
  const vx = end.x - start.x;
  const vy = end.y - start.y;
  const len = Math.hypot(vx, vy) || 1;
  const nx = -vy / len;
  const ny = vx / len;
  const base = lerp(start, end, mid.t);
  return { x: base.x + nx * mid.offset, y: base.y + ny * mid.offset };
}

// ============================================================================
// Base Action Path Component
// ============================================================================

export type LineStyle =
  | { type: "solid" }
  | { type: "dashed"; dash: number[] }
  | {
      type: "squiggle";
      wavelength: number;
      amplitude: number;
      segmentsPerWave: number;
    };

export type EndMarker = "arrow" | "bar" | "none";

export interface BaseActionPathProps<T extends BaseActionModel> {
  model: T;
  offensePlayers: PlayerRef[];
  onChange: (next: T) => void;
  toWorld: (clientX: number, clientY: number) => Point;
  lineStyle: LineStyle;
  endMarker?: EndMarker;
  barLength?: number; // Length of bar for "bar" end marker
  stroke?: string;
  strokeWidth?: number;
}

// Build polyline for the action path
export function buildActionPolyline(
  start: Point,
  end: Point,
  mid: { t: number; offset: number },
  lineStyle: LineStyle
): number[] {
  const control = getControlPoint(start, end, mid);

  if (lineStyle.type === "squiggle") {
    return buildSquigglePolyline(start, end, control, lineStyle);
  }

  // For solid or dashed lines, use a simple curve
  return buildSimplePolyline(start, end, control);
}

function buildSimplePolyline(start: Point, end: Point, control: Point): number[] {
  const N = 50; // segments for a smooth curve
  const pts: number[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = quadPoint(start, control, end, t);
    pts.push(p.x, p.y);
  }
  return pts;
}

function buildSquigglePolyline(
  start: Point,
  end: Point,
  control: Point,
  style: Extract<LineStyle, { type: "squiggle" }>
): number[] {
  // First pass: measure arc length and build arc-length lookup table
  const measureSteps = 200;
  const arcLengths: number[] = [0];
  let totalArcLength = 0;
  let prevP = quadPoint(start, control, end, 0);

  for (let i = 1; i <= measureSteps; i++) {
    const t = i / measureSteps;
    const p = quadPoint(start, control, end, t);
    const segmentLength = Math.hypot(p.x - prevP.x, p.y - prevP.y);
    totalArcLength += segmentLength;
    arcLengths.push(totalArcLength);
    prevP = p;
  }

  // Helper: given a target arc length, find the corresponding t parameter
  const arcLengthToT = (targetLength: number): number => {
    if (targetLength <= 0) return 0;
    if (targetLength >= totalArcLength) return 1;

    // Binary search in arcLengths array
    let low = 0;
    let high = arcLengths.length - 1;

    while (low < high - 1) {
      const mid = Math.floor((low + high) / 2);
      if (arcLengths[mid] < targetLength) {
        low = mid;
      } else {
        high = mid;
      }
    }

    // Linear interpolation between low and high
    const lengthBefore = arcLengths[low];
    const lengthAfter = arcLengths[high];
    const segmentLength = lengthAfter - lengthBefore;

    if (segmentLength === 0) return low / measureSteps;

    const segmentFraction = (targetLength - lengthBefore) / segmentLength;
    const tBefore = low / measureSteps;
    const tAfter = high / measureSteps;

    return tBefore + (tAfter - tBefore) * segmentFraction;
  };

  const waves = totalArcLength / style.wavelength;
  const freq = Math.PI * 2 * waves;
  const N = Math.max(32, Math.ceil(waves * style.segmentsPerWave));

  const pts: number[] = [];

  for (let i = 0; i <= N; i++) {
    // Use arc length parameterization instead of uniform t
    const arcLengthFraction = i / N;
    const targetArcLength = arcLengthFraction * totalArcLength;
    const t = arcLengthToT(targetArcLength);

    const p = quadPoint(start, control, end, t);
    const tan = quadTangent(start, control, end, t);
    const tl = Math.hypot(tan.x, tan.y) || 1;
    const n = { x: -tan.y / tl, y: tan.x / tl };

    // Apply sinusoidal offset based on an arc length fraction, not t
    const s = Math.sin(arcLengthFraction * freq) * style.amplitude;
    pts.push(p.x + n.x * s, p.y + n.y * s);
  }

  return pts;
}

// ============================================================================
// Generic Action Path Component
// ============================================================================

export function ActionPath<T extends BaseActionModel>(
  props: BaseActionPathProps<T>
) {
  const {
    model,
    offensePlayers,
    onChange,
    toWorld,
    lineStyle,
    endMarker = "arrow",
    barLength = 50,
    stroke = "#0f172a",
    strokeWidth = 3,
  } = props;

  // Track if the midpoint is being dragged
  const [isDraggingMid, setIsDraggingMid] = React.useState(false);
  const dragPosRef = React.useRef<Point | null>(null);

  // Resolve the start point
  let startPoint: Point;
  if (model.start.kind === "player") {
    const p = offensePlayers.find((pp) => pp.id === model.start.playerId);
    startPoint = p ? { x: p.x, y: p.y } : { x: 0, y: 0 };
  } else {
    startPoint = model.start.point;
  }

  const endPoint = model.end;
  const poly = buildActionPolyline(startPoint, endPoint, model.mid, lineStyle);

  // Event handlers
  const onStartDragMove = (evt: any) => {
    const { x, y } = toWorld(evt.evt.clientX, evt.evt.clientY);
    const snapR2 = ACTION_CONFIG.SNAP_RADIUS * ACTION_CONFIG.SNAP_RADIUS;
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
      onChange({ ...model, start: { kind: "player", playerId: best.id } } as T);
    } else {
      onChange({ ...model, start: { kind: "free", point: { x, y } } } as T);
    }
  };

  const onEndDragMove = (evt: any) => {
    const { x, y } = toWorld(evt.evt.clientX, evt.evt.clientY);
    onChange({ ...model, end: { x, y } } as T);
  };

  // Calculate positions
  const control = getControlPoint(startPoint, endPoint, model.mid);
  const midPos = quadPoint(startPoint, control, endPoint, 0.5);

  // Use drag position if dragging, otherwise use calculated position
  const actualMidPos = isDraggingMid && dragPosRef.current ? dragPosRef.current : midPos;

  // Arrow direction
  const beforeEnd = quadPoint(startPoint, control, endPoint, 0.95);
  const dx = endPoint.x - beforeEnd.x;
  const dy = endPoint.y - beforeEnd.y;
  const dirLen = Math.hypot(dx, dy) || 1;
  const arrowDist = ACTION_CONFIG.ARROW_LENGTH * 0.8;
  const arrowStartX = endPoint.x - (dx / dirLen) * arrowDist;
  const arrowStartY = endPoint.y - (dy / dirLen) * arrowDist;

  return (
    <Group>
      {/* Line */}
      <Line
        points={poly}
        stroke={stroke}
        strokeWidth={strokeWidth}
        listening={false}
        dash={lineStyle.type === "dashed" ? lineStyle.dash : undefined}
      />

      {/* End marker */}
      {endMarker === "arrow" && (
        <Arrow
          points={[arrowStartX, arrowStartY, endPoint.x, endPoint.y]}
          pointerLength={ACTION_CONFIG.ARROW_LENGTH}
          pointerWidth={ACTION_CONFIG.ARROW_WIDTH}
          fill={stroke}
          stroke={stroke}
          strokeWidth={strokeWidth}
          listening={false}
        />
      )}
      {endMarker === "bar" && (() => {
          const tangent = {
              x: 2 * (endPoint.x - control.x),
              y: 2 * (endPoint.y - control.y),
          };
          const len = Math.hypot(tangent.x, tangent.y);
          const perp = len ? { x: -tangent.y / len, y: tangent.x / len } : { x: 0, y: 0 };

          const halfLen = (barLength ?? 10);

        return (
            <Line
                points={[
                    endPoint.x - perp.x * halfLen,
                    endPoint.y - perp.y * halfLen,
                    endPoint.x + perp.x * halfLen,
                    endPoint.y + perp.y * halfLen,
                ]}
                stroke={stroke}
                strokeWidth={strokeWidth}
                listening={false}
            />
        );
      })()}

      {/* Start handle */}
      <Circle
        x={startPoint.x}
        y={startPoint.y}
        radius={ACTION_CONFIG.START_HANDLE_RADIUS}
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

      {/* Midpoint handle */}
      <Circle
        x={actualMidPos.x}
        y={actualMidPos.y}
        radius={ACTION_CONFIG.MID_HANDLE_RADIUS}
        fill="#f59e0b"
        stroke="#7c2d12"
        strokeWidth={2}
        draggable
        onDragStart={(evt) => {
          setIsDraggingMid(true);
          dragPosRef.current = { x: evt.target.x(), y: evt.target.y() };
          document.body.style.cursor = "grabbing";
        }}
        onDragMove={(evt) => {
          // Update drag position reference
          dragPosRef.current = { x: evt.target.x(), y: evt.target.y() };
        }}
        onDragEnd={(evt) => {
          setIsDraggingMid(false);
          const x = evt.target.x();
          const y = evt.target.y();
          const vx = endPoint.x - startPoint.x;
          const vy = endPoint.y - startPoint.y;
          const len2 = vx * vx + vy * vy || 1;
          const t = Math.max(0, Math.min(1, ((x - startPoint.x) * vx + (y - startPoint.y) * vy) / len2));
          const len = Math.sqrt(len2);
          const nx = -vy / (len || 1);
          const ny = vx / (len || 1);
          const along = { x: startPoint.x + vx * t, y: startPoint.y + vy * t };
          const offset = Math.max(-ACTION_CONFIG.MAX_CURVE_OFFSET, Math.min(ACTION_CONFIG.MAX_CURVE_OFFSET, (x - along.x) * nx + (y - along.y) * ny));
          onChange({ ...model, mid: { t, offset } } as T);
          dragPosRef.current = null;
          document.body.style.cursor = "default";
        }}
        onMouseEnter={() => (document.body.style.cursor = "grab")}
        onMouseLeave={() => (document.body.style.cursor = "default")}
      />

      {/* End handle */}
      <Circle
        x={endPoint.x}
        y={endPoint.y}
        radius={ACTION_CONFIG.END_HANDLE_RADIUS}
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
