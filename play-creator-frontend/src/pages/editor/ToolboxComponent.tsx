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

// Player button size configuration
const PLAYER_BUTTON_SIZES = {
  OFFENSE_SIZE: 40,  // Circle diameter in pixels
  DEFENSE_SIZE: 34,  // Square width/height in pixels
};

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
      {/* Actions Section */}
      <section>
        <h3 style={{ 
          margin: "0 0 8px 0",
          fontSize: "15px",
          fontWeight: 600,
          color: "#1f2937",
        }}>
          Add Actions
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.values(ACTION_CONFIGS).map((config) => (
            <button
              key={config.type}
              onClick={() => onAddAction(config.type)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "none",
                background: "#0f172a",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: tool === config.type ? "bold" : "normal",
                boxShadow: tool === config.type ? "0 0 0 2px #0f172a, 0 0 0 4px #60a5fa" : "none",
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

      <div style={{ height: 1, background: "#e5e7eb", margin: "16px 0" }} />

      {/* Players Section */}
      <section>
        <h3 style={{ 
          margin: "0 0 8px 0",
          fontSize: "15px",
          fontWeight: 600,
          color: "#1f2937",
        }}>
          Add Players
        </h3>

        <div style={{ marginBottom: 8 }}>
          <div style={{ 
            fontWeight: 500,
            fontSize: "13px",
            marginBottom: 6,
            color: "#4b5563",
          }}>
            Offense (O)
          </div>
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
                  width: `${PLAYER_BUTTON_SIZES.OFFENSE_SIZE}px`,
                  height: `${PLAYER_BUTTON_SIZES.OFFENSE_SIZE}px`,
                  borderRadius: "50%",
                  border: "2px solid #0f172a",
                  background: "#ffffff",
                  color: "#0f172a",
                  cursor: "grab",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
                title={`Add/Drag Offense ${n}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ 
            fontWeight: 500,
            fontSize: "13px",
            marginBottom: 6,
            color: "#4b5563",
          }}>
            Defense (X)
          </div>
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
                  width: `${PLAYER_BUTTON_SIZES.DEFENSE_SIZE}px`,
                  height: `${PLAYER_BUTTON_SIZES.DEFENSE_SIZE}px`,
                  borderRadius: 4,
                  border: "1px solid #c0392b",
                  background: "#fdecea",
                  color: "#972c23",
                  cursor: "grab",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "500",
                  position: "relative",
                }}
                title={`Add/Drag Defense ${n}`}
              >
                <span style={{ 
                  display: "inline-flex", 
                  alignItems: "flex-end",
                  lineHeight: 1,
                }}>
                  X
                  <span style={{ 
                    fontSize: "0.7em",
                    verticalAlign: "baseline",
                    position: "relative",
                    top: "0.25em",
                    left: "0.05em",
                  }}>
                    {n}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "#e5e7eb", margin: "16px 0" }} />

      {/* Misc Section */}
      <section>
        <h3 style={{ 
          margin: "0 0 8px 0",
          fontSize: "15px",
          fontWeight: 600,
          color: "#1f2937",
        }}>
          Misc
        </h3>
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
