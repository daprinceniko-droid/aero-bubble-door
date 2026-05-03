import { useState } from "react";

type Project = {
  title: string;
  tagline: string;
  images: [string, string, string];
};

const projects: Project[] = [
  {
    title: "Project Alpha",
    tagline: "The one that started it all",
    images: [
      "https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?w=800",
      "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800",
      "https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=800",
    ],
  },
  {
    title: "Side Quest",
    tagline: "Detour worth taking",
    images: [
      "https://images.unsplash.com/photo-1542435503-956c469947f6?w=800",
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800",
      "https://images.unsplash.com/photo-1533422902779-aff35862e462?w=800",
    ],
  },
  {
    title: "Night Drive",
    tagline: "Neon, asphalt, infinity",
    images: [
      "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?w=800",
      "https://images.unsplash.com/photo-1502920514313-52581002a659?w=800",
      "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800",
    ],
  },
  {
    title: "Grove Street",
    tagline: "Home, ese.",
    images: [
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800",
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800",
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800",
    ],
  },
  {
    title: "Last Ride",
    tagline: "Final cut, no encores",
    images: [
      "https://images.unsplash.com/photo-1494797262163-102fae527c62?w=800",
      "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=800",
      "https://images.unsplash.com/photo-1496450681664-3df85efbd29f?w=800",
    ],
  },
];

const heading = `'Anton', 'Bebas Neue', Impact, sans-serif`;

export function ProjectsCanvas() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const total = projects.length;

  const go = (d: 1 | -1) => {
    setDir(d);
    setIndex((i) => (i + d + total) % total);
  };

  const project = projects[index];

  // 3 panels: left, center, right
  const panelConfigs = [
    { rotate: -7, x: -180, y: 30, z: 1, w: 280, h: 360 },
    { rotate: 2, x: 0, y: 0, z: 3, w: 360, h: 460 },
    { rotate: 6, x: 180, y: 40, z: 2, w: 280, h: 360 },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        cursor: "url('/cursors/sa-pistol.png') 4 4, auto",
        fontFamily: heading,
        color: "#fff",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&display=swap');
        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          10% { transform: translate(-2%, -2%); }
          30% { transform: translate(2%, -1%); }
          50% { transform: translate(-1%, 2%); }
          70% { transform: translate(1%, 1%); }
          90% { transform: translate(-2%, 1%); }
        }
        .gta-grain::before {
          content: "";
          position: absolute;
          inset: -50%;
          pointer-events: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>");
          opacity: 0.18;
          mix-blend-mode: overlay;
          animation: grain 1.2s steps(4) infinite;
          z-index: 1;
        }
        @keyframes panelIn {
          0% { opacity: 0; transform: translate(var(--tx-from), var(--ty)) rotate(var(--rot-from)) scale(0.85); }
          100% { opacity: 1; transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1); }
        }
        .gta-panel {
          animation: panelIn 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
          transition: transform 300ms ease, box-shadow 300ms ease;
        }
        .gta-panel:hover {
          transform: translate(var(--tx), calc(var(--ty) - 12px)) rotate(var(--rot)) scale(1.04) !important;
          box-shadow: 0 30px 60px rgba(0,0,0,0.9), 0 0 0 2px #000;
          z-index: 99 !important;
        }
        .gta-title {
          font-family: ${heading};
          color: #fff;
          -webkit-text-stroke: 3px #000;
          text-shadow: 6px 6px 0 #000, 8px 8px 0 rgba(180,140,60,0.6);
          letter-spacing: 0.04em;
          line-height: 0.9;
        }
        .gta-arrow {
          font-family: ${heading};
          background: transparent;
          border: none;
          color: #fff;
          font-size: 96px;
          line-height: 1;
          cursor: url('/cursors/sa-pistol.png') 4 4, auto;
          text-shadow: 4px 4px 0 #000;
          transition: transform 200ms ease;
          padding: 0 24px;
          z-index: 50;
        }
        .gta-arrow:hover { transform: scale(1.15); }
        @media (max-width: 768px) {
          .gta-side-panel { display: none; }
          .gta-center-panel { width: 78vw !important; height: 60vh !important; }
          .gta-title-block { font-size: 56px !important; }
        }
      `}</style>

      <div className="gta-grain" style={{ position: "absolute", inset: 0 }} />

      {/* Title */}
      <div
        className="gta-title gta-title-block"
        style={{
          position: "absolute",
          top: 32,
          fontSize: 72,
          zIndex: 10,
          textAlign: "center",
        }}
      >
        Projects
      </div>

      {/* Stage */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
        }}
      >
        <button className="gta-arrow" aria-label="Previous" onClick={() => go(-1)} style={{ position: "absolute", left: "4%" }}>
          ‹
        </button>

        <div
          key={index}
          style={{
            position: "relative",
            width: 720,
            height: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {panelConfigs.map((cfg, i) => {
            const isCenter = i === 1;
            return (
              <div
                key={`${index}-${i}`}
                className={`gta-panel ${isCenter ? "gta-center-panel" : "gta-side-panel"}`}
                style={
                  {
                    position: "absolute",
                    width: cfg.w,
                    height: cfg.h,
                    zIndex: cfg.z,
                    background: "#111",
                    border: "4px solid #000",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05)",
                    overflow: "hidden",
                    "--tx": `${cfg.x}px`,
                    "--ty": `${cfg.y}px`,
                    "--rot": `${cfg.rotate}deg`,
                    "--tx-from": `${cfg.x + dir * 220}px`,
                    "--rot-from": `${cfg.rotate + dir * 18}deg`,
                    animationDelay: `${i * 90}ms`,
                  } as React.CSSProperties
                }
              >
                <img
                  src={project.images[i]}
                  alt={`${project.title} panel ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
                {/* Sepia overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(180,140,60,0.35) 0%, rgba(120,70,20,0.45) 100%)",
                    mixBlendMode: "multiply",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
                  }}
                />

                {isCenter && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 24,
                      padding: "0 20px",
                      textAlign: "center",
                    }}
                  >
                    <div className="gta-title" style={{ fontSize: 56 }}>
                      {project.title}
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 18,
                        letterSpacing: "0.15em",
                        color: "#f5e9c8",
                        textShadow: "2px 2px 0 #000",
                      }}
                    >
                      {project.tagline}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button className="gta-arrow" aria-label="Next" onClick={() => go(1)} style={{ position: "absolute", right: "4%" }}>
          ›
        </button>
      </div>

      {/* Dots */}
      <div style={{ position: "absolute", bottom: 32, display: "flex", gap: 12, zIndex: 10 }}>
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDir(i > index ? 1 : -1);
              setIndex(i);
            }}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "2px solid #fff",
              background: i === index ? "#fff" : "transparent",
              cursor: "url('/cursors/sa-pistol.png') 4 4, auto",
              boxShadow: "2px 2px 0 #000",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
