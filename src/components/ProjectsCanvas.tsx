import { useEffect, useRef, useState } from "react";

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
const SA_CURSOR = `url('/cursors/sa-pistol-sm.png') 2 2, auto`;

// Layout: a strip of quadrilateral shards.
// `cuts` are x-positions (% of strip width) for each vertical cut.
// `slants` are horizontal offsets (% of strip width) added to the TOP of each cut.
// Cut i is shared by shard i and shard i+1, so both use the same slant -> gap is parallel.
// `top`/`bot` clamp the top/bottom edges (% of strip height) per shard for height variation.
type Layout = {
  cuts: number[];   // length = N-1, sorted ascending, between 0 and 100
  slants: number[]; // length = N-1, top offset for each cut
  top: number[];    // length = N, top edge per shard
  bot: number[];    // length = N, bottom edge per shard
};

const layouts: Layout[] = [
  {
    cuts:   [26, 52, 76],
    slants: [-4,  3, -2],
    top:    [ 6,  2, 10,  4],
    bot:    [94, 96, 90, 92],
  },
  {
    cuts:   [22, 46, 68, 86],
    slants: [ 5, -3,  4, -2],
    top:    [10,  4,  8,  2,  6],
    bot:    [88, 96, 90, 94, 92],
  },
  {
    cuts:   [30, 58, 80],
    slants: [-3,  5, -4],
    top:    [ 4, 12,  2,  8],
    bot:    [96, 88, 94, 90],
  },
  {
    cuts:   [20, 42, 64, 84],
    slants: [ 4, -5,  3, -2],
    top:    [ 8,  2, 10,  4,  6],
    bot:    [90, 94, 88, 96, 92],
  },
  {
    cuts:   [28, 54, 78],
    slants: [-5,  2, -3],
    top:    [ 6,  4,  8,  2],
    bot:    [92, 96, 90, 94],
  },
];

// Build clip-path polygon string for shard i in a layout (in shard's own coordinate space).
function shardClip(layout: Layout, i: number, gapPct: number): string {
  const N = layout.top.length;
  const xLeftCut = i === 0 ? 0 : layout.cuts[i - 1];
  const xRightCut = i === N - 1 ? 100 : layout.cuts[i];
  const slantL = i === 0 ? 0 : layout.slants[i - 1];
  const slantR = i === N - 1 ? 0 : layout.slants[i];

  const w = xRightCut - xLeftCut;
  // Convert to local 0..100 space inside the shard's bounding box.
  // Local x of left-bottom = 0; left-top = slantL converted.
  const ltx = (-slantL / w) * 100 + (gapPct / w) * 100 * 0.5;
  const lbx = 0 + (gapPct / w) * 100 * 0.5;
  const rtx = 100 + (-slantR / w) * 100 - (gapPct / w) * 100 * 0.5;
  const rbx = 100 - (gapPct / w) * 100 * 0.5;

  const ty = layout.top[i];
  const by = layout.bot[i];

  return `polygon(${ltx}% ${ty}%, ${rtx}% ${ty}%, ${rbx}% ${by}%, ${lbx}% ${by}%)`;
}

type Spark = { id: number; x: number; y: number };

export function ProjectsCanvas() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [hoverActive, setHoverActive] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [holes, setHoles] = useState<Spark[]>([]);
  const [reachedLast, setReachedLast] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [phase, setPhase] = useState<"projects" | "fadeOut1" | "loading" | "fadeOut2" | "final">("projects");
  const idRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const total = projects.length;

  const go = (d: 1 | -1) => {
    setDir(d);
    setIndex((i) => (i + d + total) % total);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const id = ++idRef.current;
      const s: Spark = { id, x: e.clientX, y: e.clientY };
      setSparks((p) => [...p, s]);
      setHoles((p) => [...p, s]);
      window.setTimeout(() => setSparks((p) => p.filter((x) => x.id !== id)), 350);
      window.setTimeout(() => setHoles((p) => p.filter((x) => x.id !== id)), 2500);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const project = projects[index];
  const layout = layouts[index % layouts.length];
  const N = layout.top.length;
  const isLast = index === total - 1;
  const progressPct = ((index + 1) / total) * 100;
  const GAP = 1.2; // % of strip width — perpendicular gap between shards

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        overflow: "hidden",
        cursor: SA_CURSOR,
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
        .gta-root, .gta-root * {
          font-family: ${cloister} !important;
          cursor: ${SA_CURSOR};
        }
        button, a, [role="button"] { cursor: ${SA_CURSOR} !important; }

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
        .gta-stage.is-hot .shard-gif { opacity: 1; }
        .gta-stage.is-hot .shard-img { opacity: 0; }

        .gta-shard {
          animation: shardIn 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
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
          letter-spacing: 0.02em;
          line-height: 0.95;
        }
        .gta-arrow {
          background: transparent; border: none; color: #fff;
          font-size: 88px; line-height: 1;
          transition: transform 200ms ease;
          padding: 0 24px; z-index: 50;
        }
        .gta-arrow:hover { transform: scale(1.15); }

        @keyframes sparkPop {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
          60% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
        }
        .gun-spark {
          position: fixed; width: 48px; height: 48px;
          pointer-events: none; z-index: 9999;
          animation: sparkPop 350ms ease-out forwards;
          background:
            radial-gradient(circle at center, rgba(255,240,170,1) 0%, rgba(255,170,40,0.9) 30%, rgba(255,80,0,0.5) 55%, transparent 70%);
          border-radius: 50%;
          mix-blend-mode: screen;
          filter: blur(0.5px);
        }
        .gun-spark::before, .gun-spark::after {
          content:""; position:absolute; left:50%; top:50%;
          width: 60px; height: 2px;
          background: linear-gradient(90deg, transparent, #fff7c2, transparent);
          transform: translate(-50%,-50%) rotate(20deg);
        }
        .gun-spark::after { transform: translate(-50%,-50%) rotate(-55deg); width: 50px; }

        @keyframes holeFade {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .bullet-hole {
          position: fixed; width: 16px; height: 16px;
          transform: translate(-50%, -50%);
          pointer-events: none; z-index: 9998;
          border-radius: 50%;
          background: radial-gradient(circle at 45% 40%, #000 0%, #1a1a1a 45%, rgba(0,0,0,0.6) 70%, transparent 78%);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.08),
            0 0 6px 1px rgba(0,0,0,0.6);
          animation: holeFade 2.5s ease-out forwards;
        }
        .bullet-hole::before {
          content:""; position:absolute; inset:-6px;
          background:
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent 40%),
            conic-gradient(from 0deg, rgba(255,255,255,0.08), transparent 30%, rgba(255,255,255,0.08) 60%, transparent 90%);
          border-radius: 50%;
          mix-blend-mode: screen;
          filter: blur(0.6px);
        }

        @keyframes loadbarStripes {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        .gta-loadbar {
          width: min(520px, 60vw);
          height: 18px;
          border: 2px solid #fff;
          background: rgba(0,0,0,0.6);
          padding: 2px;
          box-shadow: 0 0 0 1px #000, 0 0 12px rgba(255,255,255,0.15);
          overflow: hidden;
        }
        .gta-loadbar-fill {
          height: 100%;
          background:
            repeating-linear-gradient(45deg, rgba(0,0,0,0.25) 0 8px, transparent 8px 16px),
            linear-gradient(180deg, #ffe9a8 0%, #d49a2a 50%, #8a5a10 100%);
          background-size: 40px 100%, 100% 100%;
          animation: loadbarStripes 800ms linear infinite;
          transition: width 450ms cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.4);
        }
        @keyframes continuePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .gta-continue {
          font-family: ${cloister};
          font-size: 28px;
          letter-spacing: 0.12em;
          color: #fff;
          background: transparent;
          border: 2px solid #fff;
          padding: 8px 28px;
          text-transform: uppercase;
          -webkit-text-stroke: 1px #000;
          box-shadow: 0 0 0 1px #000, 0 0 18px rgba(255,220,140,0.35);
          animation: continuePulse 1.6s ease-in-out infinite;
          transition: background 200ms ease, color 200ms ease;
        }
        .gta-continue:hover { background: #fff; color: #000; -webkit-text-stroke: 0; }

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
            textTransform: "uppercase",
          }}
        >
          PROJECTS
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
            }}
          >
            {Array.from({ length: N }).map((_, i) => {
              const xLeftCut = i === 0 ? 0 : layout.cuts[i - 1];
              const xRightCut = i === N - 1 ? 100 : layout.cuts[i];
              const slantL = i === 0 ? 0 : layout.slants[i - 1];
              const slantR = i === N - 1 ? 0 : layout.slants[i];
              const ty = layout.top[i];
              const by = layout.bot[i];

              // Bounding box in stage % coords
              const bbLeft = Math.min(xLeftCut, xLeftCut + slantL);
              const bbRight = Math.max(xRightCut, xRightCut + slantR);
              const bbW = bbRight - bbLeft;
              const bbTop = ty;
              const bbH = by - ty;

              // Local clip-path coords (within bounding box, 0..100)
              const ltx = ((xLeftCut + slantL - bbLeft) / bbW) * 100;
              const rtx = ((xRightCut + slantR - bbLeft) / bbW) * 100;
              const lbx = ((xLeftCut - bbLeft) / bbW) * 100;
              const rbx = ((xRightCut - bbLeft) / bbW) * 100;

              // Inset clip slightly along x so neighboring shards leave a parallel gap
              const gapInset = (GAP / bbW) * 100 * 0.5;
              const ltX = ltx + (i === 0 ? 0 : gapInset);
              const lbX = lbx + (i === 0 ? 0 : gapInset);
              const rtX = rtx - (i === N - 1 ? 0 : gapInset);
              const rbX = rbx - (i === N - 1 ? 0 : gapInset);
              const clip = `polygon(${ltX}% 0%, ${rtX}% 0%, ${rbX}% 100%, ${lbX}% 100%)`;

              // Background slicing: scale image so its full width = stage width,
              // then position so this bbox shows the correct slice.
              const bgSizeW = (100 / bbW) * 100;       // % width relative to bbox
              const bgSizeH = (100 / bbH) * 100;       // % height relative to bbox
              const bgPosX = bbW >= 100 ? 50 : (bbLeft / (100 - bbW)) * 100;
              const bgPosY = bbH >= 100 ? 50 : (bbTop / (100 - bbH)) * 100;

              const isMain = i === Math.floor(N / 2);

              return (
                <div
                  key={`${index}-${i}`}
                  className={`gta-shard ${isMain ? "is-main" : "is-side"}`}
                  style={
                    {
                      position: "absolute",
                      left: `${bbLeft}%`,
                      top: `${bbTop}%`,
                      width: `${bbW}%`,
                      height: `${bbH}%`,
                      clipPath: clip,
                      WebkitClipPath: clip,
                      "--tx-from": `${dir * 240}px`,
                      "--ty": `0px`,
                      "--rot": `0deg`,
                      "--rot-from": `0deg`,
                      animationDelay: `${i * 70}ms`,
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="shard-img"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(180,140,60,0.30) 0%, rgba(120,70,20,0.45) 100%), url(${project.image})`,
                      backgroundSize: `auto, ${bgSizeW}% ${bgSizeH}%`,
                      backgroundPosition: `center, ${bgPosX}% ${bgPosY}%`,
                      backgroundBlendMode: "multiply, normal",
                    }}
                  />
                  <div
                    className="shard-gif"
                    style={{
                      backgroundImage: `url(${project.gif})`,
                      backgroundSize: `${bgSizeW}% ${bgSizeH}%`,
                      backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                    }}
                  />

                  <div className="glass-refract" />
                  <div className="glass-spec" />
                  <div className="glass-edge" />
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
              color: "#f5e9c8",
            }}
          >
            {project.tagline}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 10 }}>
          {isLast ? (
            <button
              className="gta-continue"
              onClick={() => { /* continue action — wire up as needed */ }}
            >
              CONTINUE
            </button>
          ) : (
            <div className="gta-loadbar" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
              <div className="gta-loadbar-fill" style={{ width: `${progressPct}%` }} />
            </div>
          )}
        </div>
      </div>

      {holes.map((h) => (
        <div key={`h-${h.id}`} className="bullet-hole" style={{ left: h.x, top: h.y }} />
      ))}
      {sparks.map((s) => (
        <div key={`s-${s.id}`} className="gun-spark" style={{ left: s.x, top: s.y }} />
      ))}
    </div>
  );
}
