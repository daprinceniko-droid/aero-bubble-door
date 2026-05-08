import { useEffect, useRef, useState } from "react";

type Fish = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
};

const FISHES: Fish[] = [
  {
    id: "blub",
    name: "Sir Blubsworth",
    emoji: "🐠",
    color: "#ff9a3c",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sir Blubsworth glides through coral reefs with regal poise, nibbling on plankton and judging passersby with quiet dignity.",
  },
  {
    id: "gilly",
    name: "Gilly the Swift",
    emoji: "🐟",
    color: "#4fc3f7",
    description:
      "Vivamus lacinia odio vitae vestibulum. Gilly is the fastest fin in the tank, known for darting between bubbles and stealing flakes before anyone else notices.",
  },
  {
    id: "puff",
    name: "Captain Puffington",
    emoji: "🐡",
    color: "#ffd54f",
    description:
      "Sed do eiusmod tempor incididunt ut labore. Captain Puffington tells tall tales of deep-sea adventures, though he has never actually left the aquarium.",
  },
];

type Pos = { x: number; y: number; vx: number; vy: number };

export function Aquarium() {
  const [positions, setPositions] = useState<Record<string, Pos>>(() => ({
    blub: { x: 20, y: 30, vx: 0.08, vy: 0.04 },
    gilly: { x: 60, y: 60, vx: -0.12, vy: -0.05 },
    puff: { x: 40, y: 75, vx: 0.06, vy: -0.03 },
  }));
  const [dragging, setDragging] = useState<string | null>(null);
  const [inspected, setInspected] = useState<Fish | null>(null);
  const [hoverDrop, setHoverDrop] = useState(false);
  const tankRef = useRef<HTMLDivElement>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const dragPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [, force] = useState(0);

  // Swim animation
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setPositions((prev) => {
        const next: Record<string, Pos> = { ...prev };
        for (const k of Object.keys(prev)) {
          if (dragging === k) continue;
          const p = prev[k];
          let { x, y, vx, vy } = p;
          x += vx;
          y += vy;
          if (x < 5 || x > 92) vx = -vx;
          if (y < 10 || y > 88) vy = -vy;
          // Tiny wander
          vy += (Math.random() - 0.5) * 0.005;
          vy = Math.max(-0.1, Math.min(0.1, vy));
          next[k] = { x, y, vx, vy };
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      dragPos.current = { x: e.clientX - dragOffset.current.dx, y: e.clientY - dragOffset.current.dy };
      // Detect hover over inspector
      const r = inspectorRef.current?.getBoundingClientRect();
      if (r) {
        const inside =
          e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        setHoverDrop(inside);
      }
      force((n) => n + 1);
    };
    const onUp = (e: MouseEvent) => {
      const r = inspectorRef.current?.getBoundingClientRect();
      const inside =
        r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside) {
        const fish = FISHES.find((f) => f.id === dragging);
        if (fish) setInspected(fish);
      }
      // Snap fish back into tank coords based on final pointer position
      const tr = tankRef.current?.getBoundingClientRect();
      if (tr && dragging) {
        let x = ((dragPos.current.x - tr.left) / tr.width) * 100;
        let y = ((dragPos.current.y - tr.top) / tr.height) * 100;
        x = Math.max(8, Math.min(88, x));
        y = Math.max(12, Math.min(85, y));
        setPositions((prev) => ({ ...prev, [dragging]: { ...prev[dragging], x, y } }));
      }
      setDragging(null);
      setHoverDrop(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const startDrag = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const r = target.getBoundingClientRect();
    dragOffset.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    dragPos.current = { x: r.left, y: r.top };
    setDragging(id);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#f4f1ea",
        display: "flex",
        fontFamily: "'Special Elite', monospace",
        zIndex: 10001,
      }}
    >
      <style>{`
        @keyframes bubbleRise {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          15% { opacity: 0.8; }
          100% { transform: translateY(-360px) scale(1.2); opacity: 0; }
        }
        .aq-bubble {
          position: absolute; bottom: 10px;
          width: 12px; height: 12px; border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95), rgba(255,255,255,0.2) 60%, transparent 75%);
          border: 1px solid rgba(255,255,255,0.5);
          animation: bubbleRise 6s linear infinite;
          pointer-events: none;
        }
        .aq-fish {
          position: absolute;
          font-size: 54px;
          user-select: none;
          cursor: grab;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
          transition: filter 200ms ease;
        }
        .aq-fish:hover { filter: drop-shadow(0 6px 12px rgba(0,0,0,0.45)) brightness(1.1); }
        .aq-fish.dragging { cursor: grabbing; opacity: 0.9; }
        .inspector-glow {
          box-shadow: 0 0 0 3px rgba(255,180,40,0.8), 0 0 30px rgba(255,180,40,0.5) !important;
        }
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>

      {/* Aquarium - left side */}
      <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontFamily: "'Audiowide', sans-serif", fontSize: 28, margin: "0 0 16px", color: "#1a3a5c" }}>
          AQUARIUM
        </h2>
        <div
          ref={tankRef}
          style={{
            flex: 1,
            position: "relative",
            background: "linear-gradient(180deg, #4fb6e6 0%, #1a4a7a 100%)",
            borderRadius: 12,
            border: "8px solid #2c2c2c",
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(255,255,255,0.2), 0 12px 32px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}
        >
          {/* Bubbles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aq-bubble"
              style={{
                left: `${10 + i * 11}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${5 + (i % 3)}s`,
              }}
            />
          ))}
          {/* Sand */}
          <div
            style={{
              position: "absolute", left: 0, right: 0, bottom: 0, height: 40,
              background: "linear-gradient(180deg, #d4b878 0%, #a88848 100%)",
              borderTop: "2px solid rgba(0,0,0,0.2)",
            }}
          />
          {/* Seaweed */}
          {[15, 35, 70, 88].map((l, i) => (
            <div
              key={i}
              style={{
                position: "absolute", bottom: 30, left: `${l}%`,
                width: 8, height: 60 + (i % 2) * 30,
                background: "linear-gradient(180deg, #2d8a3e 0%, #1a5a28 100%)",
                borderRadius: "50% 50% 4px 4px / 30% 30% 4px 4px",
                transformOrigin: "bottom center",
                animation: `bubbleRise 0s`,
              }}
            />
          ))}

          {/* Fishes */}
          {FISHES.map((f) => {
            const p = positions[f.id];
            const isDragging = dragging === f.id;
            const tr = tankRef.current?.getBoundingClientRect();
            let style: React.CSSProperties;
            if (isDragging) {
              style = {
                position: "fixed",
                left: dragPos.current.x + dragOffset.current.dx,
                top: dragPos.current.y + dragOffset.current.dy,
                zIndex: 99999,
              };
            } else {
              style = { left: `${p.x}%`, top: `${p.y}%` };
            }
            return (
              <div
                key={f.id}
                className={`aq-fish ${isDragging ? "dragging" : ""}`}
                style={{ ...style, transform: `translate(-50%, -50%) scaleX(${p.vx < 0 ? -1 : 1})` }}
                onMouseDown={(e) => startDrag(e, f.id)}
                title={`Drag ${f.name} to inspect`}
              >
                {f.emoji}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspector - right side */}
      <div style={{ width: 380, padding: "32px 32px 32px 0", display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontFamily: "'Audiowide', sans-serif", fontSize: 28, margin: "0 0 16px", color: "#5c1a1a" }}>
          INSPECTOR
        </h2>
        <div
          ref={inspectorRef}
          className={hoverDrop ? "inspector-glow" : ""}
          style={{
            flex: 1,
            background: "#fffdf5",
            border: "2px dashed #8a6a3a",
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#5a4a2a",
            position: "relative",
            transition: "box-shadow 200ms ease",
          }}
        >
          {!inspected ? (
            <>
              <div style={{ fontSize: 64, opacity: 0.4, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, opacity: 0.7 }}>
                Drag a fish here to inspect it.
              </div>
            </>
          ) : (
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: 80, marginBottom: 8 }}>{inspected.emoji}</div>
              <h3 style={{ fontFamily: "'Audiowide', sans-serif", fontSize: 22, margin: "0 0 12px", color: inspected.color }}>
                {inspected.name}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "#3a2a1a" }}>
                {inspected.description}
              </p>
              <button
                onClick={() => setInspected(null)}
                style={{
                  marginTop: 20, padding: "8px 20px",
                  background: "#5c1a1a", color: "#fff",
                  border: "none", borderRadius: 6, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: "0.1em",
                }}
              >
                CLEAR
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
