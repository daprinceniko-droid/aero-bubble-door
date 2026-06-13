import { useEffect, useRef, useState } from "react";
import { Aquarium } from "./Aquarium";
import eventMarketingGif from "@/assets/event-marketing.gif.asset.json";
import signifyVisualizerGif from "@/assets/signify-visualizer.gif.asset.json";
import shortFormContentGif from "@/assets/short-form-content.gif.asset.json";
import webDevBrandingGif from "@/assets/web-dev-branding.gif.asset.json";


type Project = {
  title: string;
  tagline: string;
  image: string;
  gif: string;
};

const projects: Project[] = [
  {
    title: "Monster Teen",
    tagline: "Two new Monster Energy flavors",
    image: "/monster-teen.gif",
    gif: "/monster-teen.gif",
  },
  {
    title: "Event Marketing",
    tagline: "Branding that grew a brand from zero to hero",
    image: eventMarketingGif.url,
    gif: eventMarketingGif.url,
  },

  {
    title: "Signify Visualizer",
    tagline: "interactive web tool for Hue visualization",
    image: signifyVisualizerGif.url,
    gif: signifyVisualizerGif.url,
  },
  {
    title: "Short Form Content",
    tagline: "Using AI, Premiere Pro, Capcut to craft unforgettable moments",
    image: shortFormContentGif.url,
    gif: shortFormContentGif.url,
  },
  {
    title: "Web Dev & Branding",
    tagline: "Handcrafted NFT website and branding",
    image: webDevBrandingGif.url,
    gif: webDevBrandingGif.url,
  },
];

const cloister = `'Cloister Black', 'UnifrakturCook', 'Blackletter', serif`;
const pricedown = `'Pricedown', 'Pricedown Bl', Impact, 'Arial Black', sans-serif`;
const futura = `'Futura LT', 'Futura', 'Futura PT', 'Jost', 'Trebuchet MS', sans-serif`;
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

export function ProjectsCanvas({ onBack, initialPhase = "projects" }: { onBack?: () => void; initialPhase?: "projects" | "final" } = {}) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [hoverActive, setHoverActive] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [holes, setHoles] = useState<Spark[]>([]);
  const [reachedLast, setReachedLast] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [phase, setPhase] = useState<"projects" | "fadeOut1" | "loading" | "fadeOut2" | "final">(initialPhase);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [allRevealed, setAllRevealed] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const idRef = useRef(0);
  const bgAudioRef = useRef<HTMLIFrameElement | null>(null);
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
      window.setTimeout(() => setSparks((p) => p.filter((x) => x.id !== id)), 70);
      window.setTimeout(() => setHoles((p) => p.filter((x) => x.id !== id)), 2500);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const seenRef = useRef<Set<number>>(new Set());

  // On slide change: if already seen, reveal instantly; otherwise reveal shards one by one over ~2s.
  useEffect(() => {
    const layout = layouts[index % layouts.length];
    const N = layout.top.length;
    if (seenRef.current.has(index)) {
      setRevealed(new Array(N).fill(true));
      setAllRevealed(true);
      return;
    }
    setRevealed(new Array(N).fill(false));
    setAllRevealed(false);
    const order = Array.from({ length: N }, (_, i) => i).sort(() => Math.random() - 0.5);
    const totalMs = 2000;
    const step = totalMs / N;
    const timers: number[] = [];
    order.forEach((shardIdx, k) => {
      const t = window.setTimeout(() => {
        setRevealed((prev) => {
          const next = [...prev];
          next[shardIdx] = true;
          return next;
        });
        if (k === N - 1) {
          setAllRevealed(true);
          seenRef.current.add(index);
        }
      }, step * (k + 1));
      timers.push(t);
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [index]);

  // Show CONTINUE only after the last slide's shards have all revealed and the gif has started.
  useEffect(() => {
    if (index === total - 1 && allRevealed && !reachedLast) {
      const t = window.setTimeout(() => {
        setReachedLast(true);
        setShowContinue(true);
      }, 600);
      return () => window.clearTimeout(t);
    }
  }, [index, total, allRevealed, reachedLast]);

  // Auto-advance: 1s after the shard reveal animation finishes, move to next slide.
  // Stops once the user has reached the last slide so they can navigate freely.
  useEffect(() => {
    if (reachedLast) return;
    if (!allRevealed) return;
    if (index >= total - 1) return;
    const t = window.setTimeout(() => go(1), 1000);
    return () => window.clearTimeout(t);
  }, [allRevealed, index, total, reachedLast]);

  // Loading sequence after CONTINUE
  useEffect(() => {
    if (phase === "fadeOut1") {
      const t = window.setTimeout(() => setPhase("loading"), 750);
      return () => window.clearTimeout(t);
    }
    if (phase === "loading") {
      const t = window.setTimeout(() => setPhase("fadeOut2"), 6000);
      return () => window.clearTimeout(t);
    }
    if (phase === "fadeOut2") {
      const t = window.setTimeout(() => setPhase("final"), 750);
      return () => window.clearTimeout(t);
    }
  }, [phase]);

  // Background music: fade in to 50% over 2s on mount, toggle via musicOn.
  useEffect(() => {
    const send = (func: string, args: unknown[] = []) => {
      bgAudioRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    };
    let v = 0;
    send("setVolume", [0]);
    send("playVideo");
    const fade = window.setInterval(() => {
      if (!musicOn) { window.clearInterval(fade); return; }
      v = Math.min(50, v + 2.5);
      send("setVolume", [v]);
      if (v >= 50) window.clearInterval(fade);
    }, 100);
    return () => window.clearInterval(fade);
  }, []);

  useEffect(() => {
    const send = (func: string, args: unknown[] = []) => {
      bgAudioRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    };
    if (musicOn) { send("setVolume", [50]); send("playVideo"); }
    else { send("pauseVideo"); }
  }, [musicOn]);


  const project = projects[index];
  const layout = layouts[index % layouts.length];
  const N = layout.top.length;
  const progressPct = ((index + 1) / total) * 100;
  const [displayedProgress, setDisplayedProgress] = useState(0);
  useEffect(() => {
    const r = requestAnimationFrame(() => setDisplayedProgress(((index + 1) / total) * 100));
    return () => cancelAnimationFrame(r);
  }, [index, total]);
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
        @import url('https://fonts.cdnfonts.com/css/pricedown');
        @import url('https://fonts.cdnfonts.com/css/futura-lt');
        @font-face {
          font-family: 'Cloister Black';
          src: local('Cloister Black'), local('CloisterBlack');
          font-display: swap;
        }
        .gta-root, .gta-root * {
          font-family: ${cloister} !important;
          cursor: ${SA_CURSOR};
        }
        .gta-root .gta-title-projects { font-family: ${pricedown} !important; }
        .gta-root .gta-project-title { font-family: ${cloister} !important; }
        .gta-root .gta-subtitle { font-family: ${futura} !important; font-weight: 700; }

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
        .gta-stage { filter: contrast(1.02); transition: filter 400ms ease; }
        .gta-stage.is-ready { filter: contrast(1); }
        .gta-stage.is-ready .shard-gif { opacity: 1; }
        .gta-stage.is-ready .shard-img { opacity: 0; }

        .gta-shard {
          position: relative;
          overflow: hidden;
          visibility: hidden;
          transition: transform 250ms ease, filter 250ms ease;
          cursor: pointer;
        }
        .gta-shard.is-revealed { visibility: visible; }
        .gta-shard.is-revealed:hover {
          transform: translateY(-2px) scale(1.015);
          filter: brightness(1.18) saturate(1.15) drop-shadow(0 0 14px rgba(255,220,140,0.55));
          z-index: 6;
        }
        .gta-shard.is-revealed:hover .glass-spec {
          transform: translate(4%, -3%);
          opacity: 1;
          background:
            linear-gradient(115deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.0) 22%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.35) 68%, rgba(255,255,255,0) 88%),
            linear-gradient(200deg, rgba(255,255,255,0.0) 55%, rgba(255,255,255,0.22) 75%, rgba(255,255,255,0) 92%);
        }
        .gta-shard.is-revealed:hover .glass-edge {
          box-shadow:
            inset 0 0 0 1px rgba(255,240,180,0.75),
            inset 0 1px 0 rgba(255,255,255,0.85),
            inset 0 -1px 0 rgba(0,0,0,0.6),
            inset 0 0 18px rgba(255,210,120,0.35);
        }
        .gta-shard .shard-img,
        .gta-shard .shard-gif {
          position: absolute; inset: 0;
          background-repeat: no-repeat;
          transition: opacity 250ms ease;
        }
        .gta-shard .shard-gif { opacity: 0; }
        .gta-shard .glass-spec { transition: transform 350ms ease, background 350ms ease, opacity 350ms ease; }
        .gta-shard .glass-edge { transition: box-shadow 350ms ease; }

        /* CRT screen effect (static, GPU-cheap) — RGB sub-pixel grid + scanlines + vignette */
        .crt-fx {
          position: fixed; inset: 0; pointer-events: none;
          z-index: 9997;
          box-shadow:
            inset 0 0 120px 30px rgba(0,0,0,0.55),
            inset 0 0 260px 80px rgba(0,0,0,0.3);
          background-image:
            repeating-linear-gradient(
              to right,
              rgba(255, 0, 0, 0.18) 0px,
              rgba(255, 0, 0, 0.18) 1px,
              rgba(0, 255, 0, 0.18) 1px,
              rgba(0, 255, 0, 0.18) 2px,
              rgba(0, 0, 255, 0.18) 2px,
              rgba(0, 0, 255, 0.18) 3px
            );
          mix-blend-mode: screen;
        }
        .crt-fx::before {
          content: ""; position: absolute; inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            rgba(0,0,0,0.35) 0px,
            rgba(0,0,0,0.35) 1px,
            transparent 1px,
            transparent 3px
          );
          opacity: 0.55;
        }
        .crt-fx::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%);
        }
        .fisheye-stage { position: absolute; inset: 0; }


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
          animation: sparkPop 70ms ease-out forwards;
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
          transition: width 3000ms linear;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.4);
        }
        @keyframes continuePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .gta-continue {
          font-family: ${cloister};
          font-size: 18px;
          letter-spacing: 0.12em;
          color: #fff;
          background: transparent;
          border: 2px solid #fff;
          padding: 5px 18px;
          text-transform: uppercase;
          -webkit-text-stroke: 1px #000;
          box-shadow: 0 0 0 1px #000, 0 0 12px rgba(255,220,140,0.25);
          transition: background 200ms ease, color 200ms ease;
          opacity: 0;
          animation: continueFade 400ms ease-out forwards;
        }
        @keyframes continueFade { to { opacity: 1; } }
        .gta-continue:hover { background: #fff; color: #000; -webkit-text-stroke: 0; }

        /* Glass reflection shift on hover */
        .gta-stage .glass-spec { transition: transform 600ms ease, background-position 600ms ease; }
        .gta-stage.is-hot .glass-spec { transform: translate(-3%, -2%); }
        .gta-stage .glass-refract { transition: transform 700ms ease; }
        .gta-stage.is-hot .glass-refract { transform: translate(2%, 1.5%) scale(1.04); }

        @keyframes phaseFade { from { opacity: 0; } to { opacity: 1; } }
        .phase-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: #000;
          display: flex; align-items: center; justify-content: center;
          animation: phaseFade 750ms ease forwards;
        }
        .phase-loading {
          position: fixed; inset: 0; z-index: 10000;
          background: #000;
          animation: phaseFade 750ms ease forwards;
        }
        .phase-loading video {
          width: 100%; height: 100%; object-fit: cover;
        }
        .phase-final {
          position: fixed; inset: 0; z-index: 10000;
          background: #fff;
          animation: phaseFade 750ms ease forwards;
        }


        @media (max-width: 768px) {
          .gta-shard.is-side { display: none; }
          .gta-shard.is-main { width: 70vw !important; }
          .gta-title-block { font-size: 56px !important; }
        }
      `}</style>

      <div className="gta-root fisheye-stage" style={{ position: "absolute", inset: 0 }}>
        <div className="gta-grain" style={{ position: "absolute", inset: 0 }} />

        <div
          className="gta-title gta-title-block gta-title-projects"
          style={{
            position: "absolute",
            top: 24, left: 0, right: 0,
            fontSize: 120, zIndex: 10, textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
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
          {showContinue && (
            <button className="gta-arrow" aria-label="Previous" onClick={() => go(-1)} style={{ position: "absolute", left: "3%" }}>
              ‹
            </button>
          )}

          <div
            key={index}
            className={`gta-stage ${hoverActive ? "is-hot" : ""} ${allRevealed ? "is-ready" : ""}`}
            onMouseEnter={() => setHoverActive(true)}
            onMouseLeave={() => setHoverActive(false)}
            style={{
              position: "relative",
              width: "min(880px, 72vw)",
              height: "min(440px, 56vh)",
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
                  className={`gta-shard ${isMain ? "is-main" : "is-side"} ${revealed[i] ? "is-revealed" : ""}`}
                  style={
                    {
                      position: "absolute",
                      left: `${bbLeft}%`,
                      top: `${bbTop}%`,
                      width: `${bbW}%`,
                      height: `${bbH}%`,
                      clipPath: clip,
                      WebkitClipPath: clip,
                      "--tx-from": `0px`,
                      "--ty": `0px`,
                      "--rot": `0deg`,
                      "--rot-from": `0deg`,
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

          {showContinue && (
            <button className="gta-arrow" aria-label="Next" onClick={() => go(1)} style={{ position: "absolute", right: "3%" }}>
              ›
            </button>
          )}
          <button
            aria-label="Skip"
            title="Skip"
            onClick={() => setPhase("loading")}
            style={{
              position: "absolute", left: "calc(3% + 80px)", top: "50%",
              transform: "translateY(-50%)",
              width: 36, height: 36, borderRadius: "50%",
              fontFamily: "'Audiowide', sans-serif",
              background: "linear-gradient(180deg, #ff2da5, #8a0050)",
              color: "#fff",
              border: "2px solid #ffb6e6",
              letterSpacing: "0.08em",
              textShadow: "0 0 4px #fff",
              boxShadow: "0 0 10px #ff2da5",
              cursor: "pointer",
              fontSize: 9,
              zIndex: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 0,
            }}
          >
            SKIP
          </button>

        </div>

        <div
          style={{
            position: "absolute", bottom: 80, left: 0, right: 0,
            textAlign: "center", zIndex: 10,
          }}
        >
          <div className="gta-title gta-project-title" style={{ fontSize: 52 }}>{project.title}</div>
          <div
            className="gta-subtitle"
            style={{
              marginTop: 6, fontSize: 22, letterSpacing: "0.1em",
              color: "#f5e9c8",
              textTransform: "uppercase",
            }}
          >
            {project.tagline}
          </div>

        </div>

        <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 10 }}>
          {showContinue ? (
            <button
              className="gta-continue"
              onClick={() => {
                setPhase("fadeOut1");
              }}
            >
              CONTINUE
            </button>
          ) : (
            <div className="gta-loadbar" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
              <div className="gta-loadbar-fill" style={{ width: `${displayedProgress}%` }} />
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

      {/* Persistent background music — keeps playing through the loading phase, stops on final. */}
      {phase !== "final" && (
        <iframe
          ref={bgAudioRef}
          title="bg-audio"
          src="https://www.youtube.com/embed/6DpR3VSXcJk?autoplay=1&controls=0&modestbranding=1&playsinline=1&enablejsapi=1&loop=1&playlist=6DpR3VSXcJk"
          allow="autoplay"
          style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none", border: 0, left: -9999, top: -9999 }}
        />
      )}

      {/* Music toggle — hidden once loading video has completed */}
      {phase !== "final" && phase !== "fadeOut2" && (
      <>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          title="Back to about me"
          aria-label="Back"
          style={{
            position: "fixed", right: 70, bottom: 18, zIndex: 10001,
            width: 42, height: 42, borderRadius: "50%",
            background: "rgba(0,0,0,0.55)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.4)",
            fontSize: 22, lineHeight: 1, cursor: SA_CURSOR,
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
            fontFamily: cloister,
          }}
        >
          ←
        </button>
      )}
      <button
        type="button"
        onClick={() => setMusicOn((v) => !v)}
        title={musicOn ? "Mute music" : "Play music"}
        style={{
          position: "fixed", right: 18, bottom: 18, zIndex: 10001,
          width: 42, height: 42, borderRadius: "50%",
          background: "rgba(0,0,0,0.55)", color: "#fff",
          border: "1px solid rgba(255,255,255,0.4)",
          fontSize: 18, lineHeight: 1, cursor: SA_CURSOR,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}
      >
        {musicOn ? "♪" : "𝄽"}
      </button>
      </>
      )}

      {(phase === "fadeOut1") && <div className="phase-overlay" />}
      {phase === "loading" && (
        <div className="phase-loading">
          <video src="/loading_screen.mp4" autoPlay muted playsInline />
        </div>
      )}
      {phase !== "final" && <div className="crt-fx" aria-hidden />}

      {phase === "fadeOut2" && <div className="phase-overlay" />}
      {phase === "final" && <Aquarium onBack={onBack} />}
    </div>
  );
}
