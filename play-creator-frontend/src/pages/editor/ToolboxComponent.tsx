import React from "react";
import type { ActionType } from "./ActionConfigurations.tsx";
import { ACTION_CONFIGS } from "./ActionConfigurations.tsx";
import type { DragToken } from "./DragDropUtility.tsx";

interface ToolboxProps {
  scale: number;
  tool: "none" | ActionType;
  onAddAction: (type: ActionType) => void;
  onAddPlayer: (team: "offense" | "defense", number: 1 | 2 | 3 | 4 | 5) => void;
  onAddCone: () => void;
  onStartDrag: (e: React.DragEvent, data: DragToken) => void;
}

export function Toolbox({
  scale,
  tool,
  onAddAction,
  onAddPlayer,
  onAddCone,
  onStartDrag,
}: ToolboxProps) {
  return (
    <aside
      style={{
        width: 280,
        height: `calc(100vh - 48px)`,
        maxHeight: scale * 600,
        padding: 12,
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        background: "#ffffff",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <section>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Add Actions</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.values(ACTION_CONFIGS).map((config) => (
            <button
              key={config.type}
              onClick={() => onAddAction(config.type)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border:
                  tool === config.type ? "2px solid #0f172a" : "1px solid #0f172a",
                background: "#ffffff",
                color: "#0f172a",
                cursor: "pointer",
                fontWeight: tool === config.type ? "bold" : "normal",
              }}
              title={config.title}
            >
              {config.label}
            </button>
          ))}

          {["Screen", "Shot", "Handoff"].map((label) => (
            <button
              key={label}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                cursor: "not-allowed",
                color: "#475569",
              }}
              title={`${label} (coming soon)`}
              disabled
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

      <section>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Add Players</h3>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Offense (O)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={`o${n}`}
                draggable
                onDragStart={(e) =>
                  onStartDrag(e, {
                    kind: "player",
                    team: "offense",
                    number: n as 1 | 2 | 3 | 4 | 5,
                  })
                }
                onClick={() => onAddPlayer("offense", n as 1 | 2 | 3 | 4 | 5)}
                style={{
                  padding: "6px 0",
                  borderRadius: 6,
                  border: "1px solid #0f172a",
                  background: "#ffffff",
                  color: "#0f172a",
                  cursor: "grab",
                }}
                title={`Add/Drag Offense ${n}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Defense (X)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={`d${n}`}
                draggable
                onDragStart={(e) =>
                  onStartDrag(e, {
                    kind: "player",
                    team: "defense",
                    number: n as 1 | 2 | 3 | 4 | 5,
                  })
                }
                onClick={() => onAddPlayer("defense", n as 1 | 2 | 3 | 4 | 5)}
                style={{
                  padding: "6px 0",
                  borderRadius: 6,
                  border: "1px solid #c0392b",
                  background: "#fdecea",
                  color: "#972c23",
                  cursor: "grab",
                }}
                title={`Add/Drag Defense ${n}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

      <section>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Add misc</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            draggable
            onDragStart={(e) => onStartDrag(e, { kind: "cone" })}
            onClick={onAddCone}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #fb923c",
              background: "#fff7ed",
              color: "#c2410c",
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            title="Add/Drag Cone"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ display: "block" }}
            >
              <path
                d="M12 3 L19 20 H5 Z"
                fill="#f97316"
                stroke="#b45309"
                strokeWidth={1.5}
              />
              <rect x="7.2" y="13" width="9.6" height="2" fill="#ffffff" opacity={0.9} />
            </svg>
            <span>Cone</span>
          </button>
        </div>
      </section>
    </aside>
  );
}
