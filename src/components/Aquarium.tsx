import { useEffect, useRef, useState } from "react";
import videoEditorFish from "@/assets/video-editor-fish.webp.asset.json";


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
    name: "Marketing Intern",
    emoji: "🐠",
    color: "#ff4fb0",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. The Marketing Intern glides through coral reefs with regal poise, nibbling on plankton and judging passersby with quiet dignity.",
  },
  {
    id: "gilly",
    name: "Event Organizer",
    emoji: "🐟",
    color: "#ff8fd4",
    description:
      "Vivamus lacinia odio vitae vestibulum. The Event Organizer is the fastest fin in the tank, known for darting between bubbles and stealing flakes before anyone else notices.",
  },
  {
    id: "puff",
    name: "Video Editor",
    emoji: "🐡",
    color: "#ffb6e6",
    description:
      "Sed do eiusmod tempor incididunt ut labore. The Video Editor tells tall tales of deep-sea adventures, though it has never actually left the aquarium.",
  },
  {
    id: "coord",
    name: "Marketing Coordinator",
    emoji: "🐬",
    color: "#ffa3d8",
    description:
      "Ut enim ad minim veniam, quis nostrud exercitation. The Marketing Coordinator orchestrates the entire reef, keeping every fin in sync and every bubble on schedule.",
  },
];

type Pos = { x: number; y: number; vx: number; vy: number };
type Pellet = { id: number; x: number; y: number };

const GLITTER_CURSOR = `url('/cursors/pink-glitter.ani') 2 2, url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><text x='2' y='22' font-size='22'>%E2%9C%A8</text></svg>") 14 14, auto`;

// Random scattered kiss gif background positions (stable across renders)
const KISS_BG = Array.from({ length: 14 }).map(() => ({
  left: Math.random() * 92,
  top: Math.random() * 92,
  size: 70 + Math.random() * 70,
  rot: Math.random() * 60 - 30,
  opacity: 0.18 + Math.random() * 0.22,
}));

export function Aquarium({ onBack }: { onBack?: () => void } = {}) {
  const [positions, setPositions] = useState<Record<string, Pos>>(() => ({
    blub: { x: 20, y: 30, vx: 0.08, vy: 0.04 },
    gilly: { x: 60, y: 60, vx: -0.12, vy: -0.05 },
    puff: { x: 40, y: 75, vx: 0.06, vy: -0.03 },
    coord: { x: 75, y: 25, vx: -0.09, vy: 0.05 },
  }));
  const [dragging, setDragging] = useState<string | null>(null);
  const [inspected, setInspected] = useState<Fish | null>(null);
  const [hoverDrop, setHoverDrop] = useState(false);
  const [gulping, setGulping] = useState<Record<string, number>>({});
  const [pellets, setPellets] = useState<Pellet[]>([]);
  const pelletsRef = useRef<Pellet[]>([]);
  const pelletId = useRef(0);
  const tankRef = useRef<HTMLDivElement>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const dragPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [, force] = useState(0);

  useEffect(() => { pelletsRef.current = pellets; }, [pellets]);

  // Sparkles
  const sparkles = useRef(
    Array.from({ length: 40 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      dur: 2 + Math.random() * 3,
      size: 4 + Math.random() * 8,
    }))
  );

  // Swim animation — fish chase nearest pellet if any
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setPositions((prev) => {
        const next: Record<string, Pos> = { ...prev };
        const ps = pelletsRef.current;
        for (const k of Object.keys(prev)) {
          if (dragging === k) continue;
          const p = prev[k];
          let { x, y, vx, vy } = p;

          if (ps.length) {
            // find nearest pellet
            let best = ps[0];
            let bd = Infinity;
            for (const pel of ps) {
              const d = (pel.x - x) ** 2 + (pel.y - y) ** 2;
              if (d < bd) { bd = d; best = pel; }
            }
            const dx = best.x - x;
            const dy = best.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const speed = 0.25;
            vx = (dx / dist) * speed;
            vy = (dy / dist) * speed;
            // eat
            if (dist < 3) {
              setPellets((arr) => arr.filter((q) => q.id !== best.id));
              setGulping((g) => ({ ...g, [k]: (g[k] || 0) + 1 }));
              setTimeout(() => {
                setGulping((g) => {
                  const n = { ...g };
                  n[k] = Math.max(0, (n[k] || 1) - 1);
                  if (!n[k]) delete n[k];
                  return n;
                });
              }, 450);
            }
          } else {
            vy += (Math.random() - 0.5) * 0.005;
            vy = Math.max(-0.1, Math.min(0.1, vy));
          }

          x += vx;
          y += vy;
          if (x < 5) { x = 5; vx = Math.abs(vx); }
          if (x > 92) { x = 92; vx = -Math.abs(vx); }
          if (y < 10) { y = 10; vy = Math.abs(vy); }
          if (y > 88) { y = 88; vy = -Math.abs(vy); }
          next[k] = { x, y, vx, vy };
        }
        return next;
      });

      // pellets sink slowly
      setPellets((arr) =>
        arr.map((p) => ({ ...p, y: Math.min(86, p.y + 0.08) }))
      );

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      dragPos.current = { x: e.clientX - dragOffset.current.dx, y: e.clientY - dragOffset.current.dy };
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

  const feed = () => {
    const newOnes: Pellet[] = Array.from({ length: 8 }).map(() => ({
      id: ++pelletId.current,
      x: 15 + Math.random() * 70,
      y: 12 + Math.random() * 10,
    }));
    setPellets((p) => [...p, ...newOnes]);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(ellipse at 20% 10%, #2a0a20 0%, #0a0008 55%, #000 100%)",
        display: "flex",
        fontFamily: "'Special Elite', monospace",
        zIndex: 10001,
        color: "#ffd6ee",
        overflow: "hidden",
        cursor: GLITTER_CURSOR,
        animation: "aquariumFadeIn 900ms ease-out both",
      }}
    >
      <style>{`
        .aq-root, .aq-root * { cursor: ${GLITTER_CURSOR}; }
        @keyframes aquariumFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bubbleRise {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          15% { opacity: 0.9; }
          100% { transform: translateY(-360px) scale(1.2); opacity: 0; }
        }
        @keyframes sparkleTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @keyframes wiggle {
          0%   { transform: translate(-50%, -50%) rotate(-14deg) scale(1.15); }
          25%  { transform: translate(-50%, -50%) rotate(12deg) scale(1.18); }
          50%  { transform: translate(-50%, -50%) rotate(-10deg) scale(1.12); }
          75%  { transform: translate(-50%, -50%) rotate(14deg) scale(1.18); }
          100% { transform: translate(-50%, -50%) rotate(-14deg) scale(1.15); }
        }
        @keyframes pinkGlow {
          0%, 100% { box-shadow: 0 0 18px #ff2da5, 0 0 40px #ff2da5, inset 0 0 24px rgba(255,45,165,0.4); }
          50% { box-shadow: 0 0 28px #ff79c8, 0 0 60px #ff2da5, inset 0 0 32px rgba(255,121,200,0.6); }
        }
        @keyframes pelletPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 6px #ffd166; }
          50% { transform: translate(-50%, -50%) scale(1.25); box-shadow: 0 0 12px #ffe9a8; }
        }
        .aq-sparkle {
          position: absolute; pointer-events: none;
          color: #ff8ed6;
          text-shadow: 0 0 6px #ff2da5, 0 0 12px #ff2da5;
          animation: sparkleTwinkle linear infinite;
          font-family: serif;
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
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
          transition: filter 200ms ease;
        }
        .aq-fish:hover { filter: drop-shadow(0 6px 12px rgba(0,0,0,0.7)) brightness(1.1); }
        .aq-fish.dragging {
          cursor: grabbing;
          animation: wiggle 0.35s ease-in-out infinite;
          filter: drop-shadow(0 6px 14px rgba(0,0,0,0.8)) brightness(1.1);
        }
        .inspector-glow { animation: pinkGlow 1s ease-in-out infinite !important; }
        .y2k-title {
          font-family: 'Audiowide', sans-serif;
          font-size: 32px;
          margin: 0 0 16px;
          background: linear-gradient(90deg, #ff2da5, #ff8fd4, #fff, #ff8fd4, #ff2da5);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: 0.08em;
          text-shadow: 0 0 18px rgba(255,45,165,0.7);
          filter: drop-shadow(0 2px 0 #000);
        }
        @keyframes popIn {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .feed-btn {
          position: absolute; top: 0; right: 0;
          font-family: 'Audiowide', sans-serif;
          padding: 8px 22px;
          background: linear-gradient(180deg, #ff2da5, #8a0050);
          color: #fff;
          border: 2px solid #ffb6e6;
          border-radius: 8px;
          letter-spacing: 0.18em;
          text-shadow: 0 0 6px #fff;
          box-shadow: 0 0 12px #ff2da5;
          cursor: pointer;
        }
        .feed-btn:hover { filter: brightness(1.15); }
        .back-btn {
          position: absolute; top: 0; right: 150px;
          font-family: 'Audiowide', sans-serif;
          padding: 8px 16px;
          background: linear-gradient(180deg, #ff2da5, #8a0050);
          color: #fff;
          border: 2px solid #ffb6e6;
          border-radius: 8px;
          letter-spacing: 0.18em;
          text-shadow: 0 0 6px #fff;
          box-shadow: 0 0 12px #ff2da5;
          cursor: pointer;
        }
        .back-btn:hover { filter: brightness(1.15); }
      `}</style>

      {/* Scattered glitter kiss background */}
      {KISS_BG.map((k, i) => (
        <img
          key={i}
          src="/glitter-kiss.gif"
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            left: `${k.left}%`,
            top: `${k.top}%`,
            width: k.size,
            transform: `rotate(${k.rot}deg)`,
            opacity: k.opacity,
            pointerEvents: "none",
            zIndex: 0,
            filter: "drop-shadow(0 0 12px #ff2da5)",
          }}
        />
      ))}
      {/* Background sparkles */}
      {sparkles.current.map((s, i) => (
        <span
          key={i}
          className="aq-sparkle"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
            zIndex: 1,
          }}
        >
          ✦
        </span>
      ))}

      {/* Aquarium - left */}
      <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", position: "relative", zIndex: 2 }}>
        <div style={{ position: "relative" }}>
          <h2 className="y2k-title">·:*¨ Experiences ¨*:·</h2>
          {onBack && <button className="back-btn" onClick={onBack} aria-label="Back">← BACK</button>}
          <button className="feed-btn" onClick={feed}>★ FEED ★</button>
        </div>
        <div
          ref={tankRef}
          style={{
            flex: 1,
            position: "relative",
            background:
              "linear-gradient(180deg, #4fb6e6 0%, #1a4a7a 100%)",
            borderRadius: 14,
            border: "4px solid #ff2da5",
            boxShadow:
              "0 0 24px #ff2da5, 0 0 60px rgba(255,45,165,0.4), inset 0 0 60px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,180,230,0.3)",
            overflow: "hidden",
          }}
        >
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
              borderTop: "2px solid rgba(0,0,0,0.25)",
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
              }}
            />
          ))}

          {/* Sparkle pellets */}
          {pellets.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: `${p.y}%`,
                fontSize: 18,
                color: "#fff5c2",
                textShadow: "0 0 8px #ffd166, 0 0 16px #ff8fd4, 0 0 22px #ff2da5",
                animation: "pelletPulse 0.8s ease-in-out infinite",
                pointerEvents: "none",
                transform: "translate(-50%, -50%)",
                fontFamily: "serif",
                lineHeight: 1,
              }}
            >
              ✦
            </div>
          ))}

          {FISHES.map((f) => {
            const p = positions[f.id];
            const isDragging = dragging === f.id;
            if (isDragging) {
              return (
                <div
                  key={f.id}
                  className="aq-fish dragging"
                  style={{
                    position: "fixed",
                    left: dragPos.current.x + dragOffset.current.dx,
                    top: dragPos.current.y + dragOffset.current.dy,
                    zIndex: 99999,
                  }}
                  onMouseDown={(e) => startDrag(e, f.id)}
                >
                  {f.id === "puff" ? (
                    <img src={videoEditorFish.url} alt={f.name} style={{ width: 64, height: 64, objectFit: "contain", pointerEvents: "none" }} draggable={false} />
                  ) : f.emoji}

                </div>
              );
            }
            return (
              <div
                key={f.id}
                className="aq-fish"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: `translate(-50%, -50%) scaleX(${p.vx > 0 ? -1 : 1})`,
                }}
                onMouseDown={(e) => startDrag(e, f.id)}
                title={`Drag ${f.name} to inspect`}
              >
                {f.id === "puff" ? (
                  <img src={videoEditorFish.url} alt={f.name} style={{ width: 64, height: 64, objectFit: "contain", pointerEvents: "none" }} draggable={false} />
                ) : f.emoji}

              </div>
            );
          })}
        </div>
      </div>

      {/* Inspector - right */}
      <div style={{ width: 380, padding: "32px 32px 32px 0", display: "flex", flexDirection: "column", position: "relative", zIndex: 2 }}>
        <h2 className="y2k-title" style={{ fontSize: 26 }}>♡ Fish Inspector ♡</h2>
        <div
          ref={inspectorRef}
          className={hoverDrop ? "inspector-glow" : ""}
          style={{
            flex: 1,
            background:
              "linear-gradient(160deg, rgba(40,0,24,0.85) 0%, rgba(10,0,8,0.95) 100%)",
            border: "2px dashed #ff79c8",
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#ffd6ee",
            position: "relative",
            transition: "box-shadow 200ms ease",
            boxShadow: "0 0 14px rgba(255,45,165,0.5), inset 0 0 22px rgba(255,45,165,0.25)",
          }}
        >
          {!inspected ? (
            <>
              <div style={{ fontSize: 64, opacity: 0.7, marginBottom: 12, filter: "drop-shadow(0 0 10px #ff2da5)" }}>🔮</div>
              <div style={{ fontSize: 14, opacity: 0.85, letterSpacing: "0.08em" }}>
                ✧ drag a fishy here 2 inspect ✧
              </div>
            </>
          ) : (
            <div style={{ width: "100%", animation: "popIn 0.25s ease-out" }}>
              <div style={{ fontSize: 80, marginBottom: 8, filter: "drop-shadow(0 0 14px #ff2da5)" }}>{inspected.emoji}</div>
              <h3
                style={{
                  fontFamily: "'Audiowide', sans-serif",
                  fontSize: 22,
                  margin: "0 0 12px",
                  color: inspected.color,
                  textShadow: "0 0 10px #ff2da5, 0 0 20px #ff2da5",
                  letterSpacing: "0.06em",
                }}
              >
                ★ {inspected.name} ★
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#ffe0f1" }}>
                {inspected.description}
              </p>
              <button
                onClick={() => setInspected(null)}
                style={{
                  marginTop: 20,
                  padding: "8px 22px",
                  background: "linear-gradient(180deg, #ff2da5, #8a0050)",
                  color: "#fff",
                  border: "1px solid #ffb6e6",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.16em",
                  textShadow: "0 0 6px #fff",
                  boxShadow: "0 0 10px #ff2da5",
                }}
              >
                ✗ CLEAR ✗
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
