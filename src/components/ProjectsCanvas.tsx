import { useState } from "react";

const projects = [
  { title: "Project One", type: "Spell Card", attribute: "FIRE", atk: 2400, def: 1800, desc: "A blazing endeavor that ignites creativity and burns through challenges." },
  { title: "Project Two", type: "Trap Card", attribute: "WATER", atk: 1900, def: 2100, desc: "Flows seamlessly between concepts, adapting to any environment." },
  { title: "Project Three", type: "Monster Card", attribute: "EARTH", atk: 2800, def: 2500, desc: "Grounded in solid architecture, this build stands the test of time." },
  { title: "Project Four", type: "Effect Card", attribute: "WIND", atk: 2200, def: 1600, desc: "Swift and elegant, cutting through complexity with ease." },
  { title: "Project Five", type: "Ritual Card", attribute: "DARK", atk: 3000, def: 2400, desc: "A mysterious masterpiece born from forbidden experimentation." },
];

const attributeColors: Record<string, string> = {
  FIRE: "linear-gradient(135deg, #ff6b35, #c1272d)",
  WATER: "linear-gradient(135deg, #4fc3f7, #1565c0)",
  EARTH: "linear-gradient(135deg, #a1887f, #5d4037)",
  WIND: "linear-gradient(135deg, #aed581, #33691e)",
  DARK: "linear-gradient(135deg, #7e57c2, #311b92)",
};

export function ProjectsCanvas() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const total = projects.length;

  const go = (dir: 1 | -1) => {
    setDirection(dir);
    setIndex((i) => (i + dir + total) % total);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at center, #f5f5f5 0%, #d8d8d8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#111",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          fontWeight: 700,
          letterSpacing: "0.02em",
          marginBottom: "24px",
        }}
      >
        Projects
      </h1>

      <div
        style={{
          position: "relative",
          width: "100%",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: "1600px",
        }}
      >
        <button
          onClick={() => go(-1)}
          aria-label="Previous"
          style={{
            position: "absolute",
            left: "8%",
            zIndex: 100,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "1px solid #bbb",
            background: "rgba(255,255,255,0.9)",
            cursor: "pointer",
            fontSize: 22,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          ←
        </button>

        <div
          style={{
            position: "relative",
            width: 320,
            height: 460,
            transformStyle: "preserve-3d",
          }}
        >
          {projects.map((p, i) => {
            // signed shortest distance from current index (handles wraparound)
            let offset = i - index;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const abs = Math.abs(offset);
            const isActive = offset === 0;

            const translateX = offset * 140;
            const translateZ = -abs * 220;
            const rotateY = offset * -25;
            const opacity = abs > 2 ? 0 : 1 - abs * 0.2;
            const zIndex = 50 - abs;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                  transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease",
                  opacity,
                  zIndex,
                  transformStyle: "preserve-3d",
                  animation: isActive ? "cardFloat 4s ease-in-out infinite" : undefined,
                }}
              >
                <YuGiOhCard project={p} active={isActive} />
              </div>
            );
          })}

          {/* whoosh streaks on transition */}
          <div
            key={`whoosh-${index}-${direction}`}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              animation: "whoosh 600ms ease-out forwards",
              background: `linear-gradient(${direction === 1 ? "90deg" : "270deg"}, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)`,
              filter: "blur(8px)",
              opacity: 0,
            }}
          />
        </div>

        <button
          onClick={() => go(1)}
          aria-label="Next"
          style={{
            position: "absolute",
            right: "8%",
            zIndex: 100,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "1px solid #bbb",
            background: "rgba(255,255,255,0.9)",
            cursor: "pointer",
            fontSize: 22,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          →
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 24, marginBottom: 16 }}>
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              border: "none",
              background: i === index ? "#111" : "#bbb",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes whoosh {
          0% { opacity: 0; transform: scaleX(0.5); }
          40% { opacity: 1; }
          100% { opacity: 0; transform: scaleX(1.5); }
        }
      `}</style>
    </div>
  );
}

function YuGiOhCard({ project, active }: { project: typeof projects[number]; active: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 14,
        padding: 12,
        background: "linear-gradient(145deg, #d4a85a 0%, #b8862f 50%, #8a5a1a 100%)",
        boxShadow: active
          ? "0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212,168,90,0.6), inset 0 0 0 2px #5a3a10"
          : "0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 2px #5a3a10",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontFamily: "'Times New Roman', serif",
        color: "#1a1a1a",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "4px 8px",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, textShadow: "1px 1px 0 rgba(255,255,255,0.3)" }}>
          {project.title}
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: attributeColors[project.attribute],
            border: "2px solid #1a1a1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {project.attribute.slice(0, 1)}
        </div>
      </div>

      {/* Artwork */}
      <div
        style={{
          flex: 1,
          background: attributeColors[project.attribute],
          border: "2px solid #1a1a1a",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4), transparent 60%)",
          }}
        />
        <div style={{ fontSize: 64, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
          {project.attribute.slice(0, 1)}
        </div>
      </div>

      {/* Type bar */}
      <div
        style={{
          background: "#1a1a1a",
          color: "#d4a85a",
          padding: "3px 8px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.05em",
          borderRadius: 2,
        }}
      >
        [{project.type.toUpperCase()}]
      </div>

      {/* Description */}
      <div
        style={{
          background: "#f5e9c8",
          border: "1px solid #1a1a1a",
          borderRadius: 2,
          padding: "6px 8px",
          fontSize: 10,
          lineHeight: 1.3,
          minHeight: 60,
          fontStyle: "italic",
        }}
      >
        {project.desc}
      </div>

      {/* ATK/DEF */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          padding: "2px 8px",
          fontSize: 12,
          fontWeight: 700,
          color: "#1a1a1a",
        }}
      >
        <span>ATK/{project.atk}</span>
        <span>DEF/{project.def}</span>
      </div>
    </div>
  );
}
