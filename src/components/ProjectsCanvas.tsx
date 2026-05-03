import { useState } from "react";
import sunset from "@/assets/la-sunset.jpg";

const projects = [
  { type: "Spell Card", attribute: "FIRE", desc: "A blazing endeavor that ignites creativity and burns through challenges." },
  { type: "Trap Card", attribute: "WATER", desc: "Flows seamlessly between concepts, adapting to any environment." },
  { type: "Monster Card", attribute: "EARTH", desc: "Grounded in solid architecture, this build stands the test of time." },
  { type: "Effect Card", attribute: "WIND", desc: "Swift and elegant, cutting through complexity with ease." },
  { type: "Ritual Card", attribute: "DARK", desc: "A mysterious masterpiece born from forbidden experimentation." },
];

const attributeColors: Record<string, string> = {
  FIRE: "linear-gradient(135deg, #ff6b35, #c1272d)",
  WATER: "linear-gradient(135deg, #4fc3f7, #1565c0)",
  EARTH: "linear-gradient(135deg, #a1887f, #5d4037)",
  WIND: "linear-gradient(135deg, #aed581, #33691e)",
  DARK: "linear-gradient(135deg, #7e57c2, #311b92)",
};

const cloister = `'Cloister Black', 'UnifrakturCook', 'Blackletter', serif`;

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
        backgroundImage: `linear-gradient(180deg, rgba(40,0,40,0.25) 0%, rgba(0,0,0,0.55) 100%), url(${sunset})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px",
        fontFamily: cloister,
        color: "#f5e9c8",
        overflow: "hidden",
        cursor: "url('/cursors/sa-pistol.png') 4 4, auto",
      }}
    >
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/cloister-black');
        @import url('https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap');
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes whoosh {
          0% { opacity: 0; transform: scaleX(0.5); }
          40% { opacity: 1; }
          100% { opacity: 0; transform: scaleX(1.5); }
        }
        .gfunk-title {
          background: linear-gradient(180deg, #fff2b0 0%, #ffb347 45%, #c1272d 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 0 rgba(0,0,0,0.35);
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6));
        }
      `}</style>

      <h1
        className="gfunk-title"
        style={{
          fontFamily: cloister,
          fontSize: "84px",
          fontWeight: 400,
          letterSpacing: "0.02em",
          marginBottom: "16px",
          lineHeight: 1,
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
            border: "2px solid #c1272d",
            background: "rgba(0,0,0,0.6)",
            color: "#f5e9c8",
            cursor: "url('/cursors/sa-pistol.png') 4 4, auto",
            fontSize: 22,
            fontFamily: cloister,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
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

          <div
            key={`whoosh-${index}-${direction}`}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              animation: "whoosh 600ms ease-out forwards",
              background: `linear-gradient(${direction === 1 ? "90deg" : "270deg"}, transparent 0%, rgba(255,200,120,0.5) 50%, transparent 100%)`,
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
            border: "2px solid #c1272d",
            background: "rgba(0,0,0,0.6)",
            color: "#f5e9c8",
            cursor: "url('/cursors/sa-pistol.png') 4 4, auto",
            fontSize: 22,
            fontFamily: cloister,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
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
              border: "1px solid rgba(0,0,0,0.5)",
              background: i === index ? "#f5e9c8" : "rgba(245,233,200,0.35)",
              cursor: "url('/cursors/sa-pistol.png') 4 4, auto",
              padding: 0,
            }}
          />
        ))}
      </div>
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
          ? "0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,150,80,0.55), inset 0 0 0 2px #5a3a10"
          : "0 20px 40px rgba(0,0,0,0.5), inset 0 0 0 2px #5a3a10",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontFamily: cloister,
        color: "#1a1a1a",
      }}
    >
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
        <div
          style={{
            fontFamily: cloister,
            fontSize: 96,
            color: "rgba(255,255,255,0.9)",
            fontWeight: 400,
            textShadow: "0 4px 0 rgba(0,0,0,0.4)",
          }}
        >
          {project.attribute.slice(0, 1)}
        </div>
      </div>

      {/* Type bar */}
      <div
        style={{
          background: "#1a1a1a",
          color: "#d4a85a",
          padding: "4px 10px",
          fontSize: 18,
          fontFamily: cloister,
          letterSpacing: "0.05em",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        [{project.type}]
      </div>

      {/* Description */}
      <div
        style={{
          background: "#f5e9c8",
          border: "1px solid #1a1a1a",
          borderRadius: 2,
          padding: "8px 10px",
          fontSize: 13,
          lineHeight: 1.35,
          minHeight: 70,
          fontFamily: "'Times New Roman', serif",
          fontStyle: "italic",
        }}
      >
        {project.desc}
      </div>
    </div>
  );
}
