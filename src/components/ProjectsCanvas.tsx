import { useState } from "react";

type Project = {
  title: string;
  tagline: string;
  image: string;
  gif: string;
};

const projects: Project[] = [
  {
    title: "Project Alpha",
    tagline: "The one that started it all",
    image: "https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?w=1600",
    gif: "https://media.giphy.com/media/3o7TKsQ8Xb3Yh3cFGE/giphy.gif",
  },
  {
    title: "Side Quest",
    tagline: "Detour worth taking",
    image: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=1600",
    gif: "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
  },
  {
    title: "Night Drive",
    tagline: "Neon, asphalt, infinity",
    image: "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?w=1600",
    gif: "https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif",
  },
  {
    title: "Grove Street",
    tagline: "Home, ese.",
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600",
    gif: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  },
  {
    title: "Last Ride",
    tagline: "Final cut, no encores",
    image: "https://images.unsplash.com/photo-1494797262163-102fae527c62?w=1600",
    gif: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
  },
];

const cloister = `'Cloister Black', 'UnifrakturCook', 'Blackletter', serif`;

type Shard = { wPct: number; hPct: number; rot: number; yOff: number };

// One unique shattered layout per project so no two slides look the same.
const layouts: Shard[][] = [
  [
    { wPct: 22, hPct: 78, rot: -3, yOff: 4 },
    { wPct: 30, hPct: 92, rot: 1.5, yOff: -2 },
    { wPct: 22, hPct: 80, rot: -1, yOff: 6 },
    { wPct: 22, hPct: 74, rot: 3, yOff: 2 },
  ],
  [
    { wPct: 18, hPct: 64, rot: 4, yOff: -10 },
    { wPct: 26, hPct: 88, rot: -2, yOff: 8 },
    { wPct: 18, hPct: 72, rot: 2, yOff: -4 },
    { wPct: 14, hPct: 56, rot: -5, yOff: 14 },
    { wPct: 20, hPct: 82, rot: 1, yOff: 0 },
  ],
  [
    { wPct: 28, hPct: 90, rot: -2, yOff: 6 },
    { wPct: 16, hPct: 60, rot: 5, yOff: -12 },
    { wPct: 22, hPct: 84, rot: -1, yOff: 2 },
    { wPct: 30, hPct: 70, rot: 2.5, yOff: 10 },
  ],
  [
    { wPct: 14, hPct: 70, rot: -4, yOff: 8 },
    { wPct: 20, hPct: 86, rot: 2, yOff: -6 },
    { wPct: 18, hPct: 62, rot: -2, yOff: 12 },
    { wPct: 24, hPct: 92, rot: 1, yOff: 0 },
    { wPct: 20, hPct: 76, rot: -3, yOff: 4 },
  ],
  [
    { wPct: 32, hPct: 86, rot: 1, yOff: -4 },
    { wPct: 18, hPct: 70, rot: -3, yOff: 10 },
    { wPct: 24, hPct: 92, rot: 2, yOff: 0 },
    { wPct: 22, hPct: 64, rot: -2, yOff: 8 },
  ],
];

export function ProjectsCanvas() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [hoverActive, setHoverActive] = useState(false);
  const total = projects.length;

  const go = (d: 1 | -1) => {
    setDir(d);
    setIndex((i) => (i + d + total) % total);
  };

  const project = projects[index];
  const shards = layouts[index % layouts.length];
  const totalW = shards.reduce((s, c) => s + c.wPct, 0);

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
        fontFamily: cloister,
        color: "#fff",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&family=UnifrakturMaguntia&display=swap');
        @font-face {
          font-family: 'Cloister Black';
          src: local('Cloister Black'), local('CloisterBlack');
          font-display: swap;
        }
        .gta-root, .gta-root * { font-family: ${cloister} !important; }

        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          25% { transform: translate(-2%, -1%); }
          50% { transform: translate(1%, 2%); }
          75% { transform: translate(-1%, 1%); }
        }
        .gta-grain::before {
          content: "";
          position: absolute; inset: -50%;
          pointer-events: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>");
          opacity: 0.18;
          mix-blend-mode: overlay;
          animation: grain 1.2s steps(4) infinite;
          z-index: 1;
        }
        @keyframes shardIn {
          0% { opacity: 0; transform: translate(var(--tx-from), var(--ty)) rotate(var(--rot-from)); }
          100% { opacity: 1; transform: translate(0, var(--ty)) rotate(var(--rot)); }
        }
        .gta-stage { filter: grayscale(1) contrast(1.05); transition: filter 400ms ease; }
        .gta-stage.is-hot { filter: grayscale(0) contrast(1); }

        .gta-shard {
          animation: shardIn 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
          transition: box-shadow 300ms ease;
          position: relative;
          overflow: hidden;
        }
        .gta-shard .shard-img,
        .gta-shard .shard-gif {
          position: absolute; inset: 0;
          background-repeat: no-repeat;
          transition: opacity 250ms ease;
        }
        .gta-shard .shard-gif { opacity: 0; }
        .gta-shard:hover .shard-gif { opacity: 1; }
        .gta-shard:hover .shard-img { opacity: 0; }
        .gta-shard:hover { box-shadow: 0 28px 60px rgba(0,0,0,0.95); z-index: 50; }

        /* Glass specular + refraction overlays */
        .glass-spec {
          position: absolute; inset: 0; pointer-events: none;
          background:
            linear-gradient(115deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.0) 18%, rgba(255,255,255,0) 55%, rgba(255,255,255,0.18) 70%, rgba(255,255,255,0) 85%),
            linear-gradient(200deg, rgba(255,255,255,0.0) 60%, rgba(255,255,255,0.12) 78%, rgba(255,255,255,0) 92%);
          mix-blend-mode: screen;
          opacity: 0.85;
        }
        .glass-refract {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(120% 80% at 20% 10%, rgba(120,200,255,0.18), transparent 55%),
            radial-gradient(120% 80% at 85% 90%, rgba(255,160,90,0.18), transparent 55%),
            linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.18) 100%);
          mix-blend-mode: overlay;
        }
        .glass-edge {
          position: absolute; inset: 0; pointer-events: none;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.35),
            inset 0 1px 0 rgba(255,255,255,0.55),
            inset 0 -1px 0 rgba(0,0,0,0.6);
        }

        .gta-title {
          color: #fff;
          -webkit-text-stroke: 2px #000;
          text-shadow: 5px 5px 0 #000, 7px 7px 0 rgba(180,140,60,0.55);
          letter-spacing: 0.02em;
          line-height: 0.95;
        }
        .gta-arrow {
          background: transparent; border: none; color: #fff;
          font-size: 88px; line-height: 1;
          cursor: url('/cursors/sa-pistol.png') 4 4, auto;
          text-shadow: 4px 4px 0 #000;
          transition: transform 200ms ease;
          padding: 0 24px; z-index: 50;
        }
        .gta-arrow:hover { transform: scale(1.15); }
        @media (max-width: 768px) {
          .gta-shard.is-side { display: none; }
          .gta-shard.is-main { width: 70vw !important; }
          .gta-title-block { font-size: 56px !important; }
        }
      `}</style>

      <div className="gta-root" style={{ position: "absolute", inset: 0 }}>
        <div className="gta-grain" style={{ position: "absolute", inset: 0 }} />

        <div
          className="gta-title gta-title-block"
          style={{
            position: "absolute",
            top: 24, left: 0, right: 0,
            fontSize: 88, zIndex: 10, textAlign: "center",
          }}
        >
          Projects
        </div>

        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 5,
          }}
        >
          <button className="gta-arrow" aria-label="Previous" onClick={() => go(-1)} style={{ position: "absolute", left: "3%" }}>
            ‹
          </button>

          <div
            key={index}
            className={`gta-stage ${hoverActive ? "is-hot" : ""}`}
            onMouseEnter={() => setHoverActive(true)}
            onMouseLeave={() => setHoverActive(false)}
            style={{
              position: "relative",
              width: "min(1100px, 88vw)",
              height: "min(560px, 70vh)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {shards.map((s, i) => {
              const leftPct = shards.slice(0, i).reduce((a, c) => a + c.wPct, 0);
              const bgPosX = totalW === s.wPct ? 50 : (leftPct / (totalW - s.wPct)) * 100;
              const bgSize = `${(100 / s.wPct) * totalW}% auto`;
              const isMain = i === Math.floor(shards.length / 2);

              return (
                <div
                  key={`${index}-${i}`}
                  className={`gta-shard ${isMain ? "is-main" : "is-side"}`}
                  style={
                    {
                      flex: `0 0 ${s.wPct}%`,
                      height: `${s.hPct}%`,
                      border: "3px solid #000",
                      boxShadow: "0 18px 40px rgba(0,0,0,0.85)",
                      "--tx-from": `${dir * 240}px`,
                      "--ty": `${s.yOff}px`,
                      "--rot": `${s.rot}deg`,
                      "--rot-from": `${s.rot + dir * 12}deg`,
                      animationDelay: `${i * 70}ms`,
                      transform: `translate(0, ${s.yOff}px) rotate(${s.rot}deg)`,
                    } as React.CSSProperties
                  }
                >
                  {/* Static image (default) */}
                  <div
                    className="shard-img"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(180,140,60,0.30) 0%, rgba(120,70,20,0.45) 100%), url(${project.image})`,
                      backgroundSize: `auto, ${bgSize}`,
                      backgroundPosition: `center, ${bgPosX}% center`,
                      backgroundBlendMode: "multiply, normal",
                    }}
                  />
                  {/* Gif (plays on hover) */}
                  <div
                    className="shard-gif"
                    style={{
                      backgroundImage: `url(${project.gif})`,
                      backgroundSize: `${bgSize}`,
                      backgroundPosition: `${bgPosX}% center`,
                    }}
                  />

                  {/* Glass refraction tint */}
                  <div className="glass-refract" />
                  {/* Specular highlight streak */}
                  <div className="glass-spec" />
                  {/* Crisp inner edge */}
                  <div className="glass-edge" />
                  {/* Vignette */}
                  <div
                    style={{
                      position: "absolute", inset: 0,
                      background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              );
            })}
          </div>

          <button className="gta-arrow" aria-label="Next" onClick={() => go(1)} style={{ position: "absolute", right: "3%" }}>
            ›
          </button>
        </div>

        <div
          style={{
            position: "absolute", bottom: 80, left: 0, right: 0,
            textAlign: "center", zIndex: 10,
          }}
        >
          <div className="gta-title" style={{ fontSize: 52 }}>{project.title}</div>
          <div
            style={{
              marginTop: 6, fontSize: 22, letterSpacing: "0.1em",
              color: "#f5e9c8", textShadow: "2px 2px 0 #000",
            }}
          >
            {project.tagline}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 12, zIndex: 10 }}>
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); }}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: 14, height: 14, borderRadius: "50%",
                border: "2px solid #fff",
                background: i === index ? "#fff" : "transparent",
                cursor: "url('/cursors/sa-pistol.png') 4 4, auto",
                boxShadow: "2px 2px 0 #000", padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
