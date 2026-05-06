import { useEffect, useRef, useState, useCallback } from "react";

const TRACKS = [
  { title: "My Worst Enemy", artist: "Lit", videoId: "4vg7JoGGJic" },
  { title: "What The Hell x Language (CONTRABAND Bootleg)", artist: "Ulrich von Strudelheim", videoId: "l85Wz97uf8E" },
  { title: "Drag Racer (Metal Maniacs)", artist: "Hot Wheels Acceleracers OST", videoId: "XxAgFN7ceBU" },
  { title: "Radio Up", artist: "Letter Kills", videoId: "TEEu5PuXLP4" },
  { title: "Hood Took Me Under", artist: "Compton's Most Wanted", videoId: "cDOEJ5YKuQQ" },
];

const AMBIENT_VIDEO_ID = "4XfgTd17-Kk";
const EASTER_EGG_VIDEO_ID = "1AM_VSfudig";

// YouTube IFrame API types (minimal)
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

export function Y2KPlaceholder({ onCanvasFull, started = true }: { onCanvasFull?: () => void; started?: boolean } = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const autoplayedRef = useRef(false);

  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [easterEgg, setEasterEgg] = useState(false);
  const [doorPhase, setDoorPhase] = useState<"idle" | "opening" | "zoom" | "full">("idle");

  const track = TRACKS[trackIdx];

  // Looping cloud video
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  // Load YouTube IFrame API once
  useEffect(() => {
    const init = () => {
      if (!ytContainerRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(ytContainerRef.current, {
        height: "0",
        width: "0",
        videoId: TRACKS[0].videoId,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1 },
        events: {
          onReady: (e: any) => {
            setReady(true);
            e.target.setVolume(volume);
            setDuration(e.target.getDuration() || 0);
          },
          onStateChange: (e: any) => {
            const YT = window.YT;
            if (e.data === YT.PlayerState.PLAYING) setPlaying(true);
            else if (
              e.data === YT.PlayerState.PAUSED ||
              e.data === YT.PlayerState.ENDED
            )
              setPlaying(false);
            if (e.data === YT.PlayerState.ENDED) {
              setTrackIdx((i) => (i + 1) % TRACKS.length);
            }
            if (e.data === YT.PlayerState.PLAYING) {
              setDuration(e.target.getDuration() || 0);
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      init();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]',
      );
      if (!existing) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = init;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch track when trackIdx changes (cue only — don't autoplay until user has started)
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    try {
      if (started) {
        playerRef.current.loadVideoById(TRACKS[trackIdx].videoId);
      } else {
        playerRef.current.cueVideoById(TRACKS[trackIdx].videoId);
      }
    } catch {
      /* noop */
    }
  }, [trackIdx, ready, started]);

  // Progress polling
  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      setCurrent(p.getCurrentTime() || 0);
      const d = p.getDuration?.() || 0;
      if (d && Math.abs(d - duration) > 1) setDuration(d);
    }, 500);
    return () => clearInterval(id);
  }, [ready, duration]);

  // Autoplay when the Y2K screen becomes visible AND the user has signaled "ready" (clicked Enter)
  useEffect(() => {
    if (!ready || !started) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3 && !autoplayedRef.current) {
            autoplayedRef.current = true;
            try { playerRef.current?.playVideo?.(); } catch { /* noop */ }
          }
        }
      },
      { threshold: [0, 0.3, 0.6] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ready, started]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }, [playing]);

  const stop = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    p.stopVideo();
    setCurrent(0);
  }, []);

  const next = useCallback(() => {
    setTrackIdx((i) => (i + 1) % TRACKS.length);
  }, []);
  const prev = useCallback(() => {
    setTrackIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length);
  }, []);

  const seek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressBarRef.current;
      const p = playerRef.current;
      if (!bar || !p || !duration) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      p.seekTo(pct * duration, true);
      setCurrent(pct * duration);
    },
    [duration],
  );

  const changeVolume = useCallback((v: number) => {
    setVolume(v);
    playerRef.current?.setVolume?.(v);
  }, []);

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div className="y2k-screen" ref={rootRef}>
      {/* Hidden YouTube player */}
      <div
        style={{
          position: "fixed",
          left: -9999,
          top: -9999,
          width: 1,
          height: 1,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <div ref={ytContainerRef} />
      </div>

      {/* Easter egg hidden audio */}
      {easterEgg && (
        <iframe
          key="easter-egg"
          title="easter-egg"
          src={`https://www.youtube.com/embed/${EASTER_EGG_VIDEO_ID}?autoplay=1&controls=0&loop=1&playlist=${EASTER_EGG_VIDEO_ID}`}
          allow="autoplay; encrypted-media"
          style={{
            position: "fixed",
            left: -9999,
            top: -9999,
            width: 1,
            height: 1,
            pointerEvents: "none",
            opacity: 0,
            border: 0,
          }}
        />
      )}

      {/* Grunge overlays */}
      <div className="y2k-noise" />
      <div className="y2k-scratches" />
      <div className="y2k-vignette" />

      {/* Stickers */}
      <div className="y2k-sticker y2k-sticker--biohazard" style={{ top: "8%", left: "3%" }}>☢</div>
      <div className="y2k-sticker y2k-sticker--star" style={{ top: "20%", left: "8%" }}>★</div>
      <div className="y2k-sticker y2k-sticker--skull" style={{ bottom: "12%", left: "4%" }}>☠</div>
      <div className="y2k-sticker y2k-sticker--smile" style={{ top: "70%", left: "18%" }}>☻</div>
      <div className="y2k-sticker y2k-sticker--lightning" style={{ top: "12%", right: "32%" }}>⚡</div>
      <div className="y2k-sticker y2k-sticker--peace" style={{ bottom: "8%", right: "30%" }}>☮</div>
      <div className="y2k-sticker y2k-sticker--anarchy" style={{ top: "55%", left: "2%" }}>Ⓐ</div>
      <div className="y2k-sticker y2k-sticker--heart" style={{ top: "30%", right: "35%", color: "#ff3366" }}>♥</div>

      {/* Tape strips */}
      <div className="y2k-tape y2k-tape--1">PROPERTY OF // DO NOT REMOVE</div>
      <div className="y2k-tape y2k-tape--2">XxX_2003_XxX</div>

      {/* Stamps */}
      <div className="y2k-stamp y2k-stamp--top">CLASSIFIED</div>
      <div className="y2k-stamp y2k-stamp--bottom">REJECT // 187</div>

      {/* Center video frame */}
      <div className="y2k-video-frame">
        <div className="y2k-video-corner y2k-video-corner--tl">+</div>
        <div className="y2k-video-corner y2k-video-corner--tr">+</div>
        <div className="y2k-video-corner y2k-video-corner--bl">+</div>
        <div className="y2k-video-corner y2k-video-corner--br">+</div>
        <div className="y2k-video-tag">REC ●</div>
        <video
          ref={videoRef}
          src="/about-me.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="y2k-video"
        />
        <div className="y2k-scanline" />
      </div>

      {/* Republic Commando-style dossier panel */}
      <div className={`rc-door rc-door--${doorPhase}`}>
        <div className="rc-canvas" />
        <div className="rc-dossier">
        <div className="rc-dossier__header">
          <div className="rc-dossier__badge">CLASSIFIED // EYES ONLY</div>
          <div
            className="rc-dossier__code rc-dossier__code--easter"
            onClick={() => {
              setEasterEgg((v) => {
                const next = !v;
                // Turning the easter egg ON should silence the main player
                if (next) {
                  try { playerRef.current?.pauseVideo?.(); } catch { /* noop */ }
                }
                return next;
              });
            }}
            title="???"
          >
            FILE-1738-AY — Easter Egg
          </div>
        </div>
        <h2 className="rc-dossier__title">
          Subject: <em>About Me</em>
        </h2>
        <div className="rc-dossier__subtitle">Operative Dossier · Briefing 01</div>
        <div className="rc-dossier__body">
          <p>
            <span className="drop">L</span>orem ipsum dolor sit amet, consectetur adipiscing elit.
            Chaos has erupted throughout the network. As leader of an elite squad of pixel
            commandos, your mission is to infiltrate, dominate, and ultimately annihilate
            the boredom. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
            voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
          <p>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
            deserunt mollit anim id est laborum — they are your weapon.
          </p>
        </div>
        <div className="rc-dossier__access">
          <button
            type="button"
            className="rc-dossier__proceed"
            onClick={() => {
              if (doorPhase !== "idle") return;
              setDoorPhase("opening");
              window.setTimeout(() => setDoorPhase("zoom"), 1100);
              window.setTimeout(() => {
                setDoorPhase("full");
                // Stop everything once the white canvas takes over
                try { playerRef.current?.stopVideo?.(); } catch { /* noop */ }
                setEasterEgg(false);
                // Tell the parent it's safe to unmount the entire Y2K screen
                window.setTimeout(() => onCanvasFull?.(), 600);
              }, 2400);
            }}
          >
            ▶ Proceed
          </button>
          <span className="rc-dossier__granted">Access Granted</span>
        </div>
        </div>
        <div className="rc-door__leaf rc-door__leaf--left" aria-hidden />
        <div className="rc-door__leaf rc-door__leaf--right" aria-hidden />
      </div>

      {/* Winamp player */}
      <div className="winamp">
        <div className="winamp__chrome">
          <div className="winamp__title">
            <span className="winamp__logo">▶</span>
            <span>WIND AMP — Now Playing</span>
          </div>
          <div className="winamp__window-btns">
            <span>_</span><span>□</span><span>×</span>
          </div>
        </div>

        <div className="winamp__display">
          <div className="winamp__viz winamp__viz--video">
            <iframe
              className="winamp__viz-iframe"
              src={`https://www.youtube.com/embed/${AMBIENT_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${AMBIENT_VIDEO_ID}&modestbranding=1&playsinline=1&disablekb=1&rel=0&iv_load_policy=3`}
              title="ambient"
              frameBorder={0}
              allow="autoplay; encrypted-media; picture-in-picture"
              tabIndex={-1}
            />
            <div className="winamp__viz-lock" />
            <div className="winamp__viz-scanline" />
          </div>
          <div className="winamp__track-info">
            <div className="winamp__track">{track.title}</div>
            <div className="winamp__artist">{track.artist}</div>
            
          </div>
        </div>

        <div className="winamp__controls">
          <button className="winamp__btn" onClick={prev} title="Previous">⏮</button>
          <button
            className="winamp__btn winamp__btn--play"
            onClick={togglePlay}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <button className="winamp__btn" onClick={stop} title="Stop">■</button>
          <button className="winamp__btn" onClick={next} title="Next">⏭</button>
          <div
            className="winamp__progress"
            ref={progressBarRef}
            onClick={seek}
          >
            <div className="winamp__progress-fill" style={{ width: `${pct}%` }} />
            <div className="winamp__progress-thumb" style={{ left: `${pct}%` }} />
          </div>
          <div className="winamp__time">
            {fmt(current)} / {fmt(duration)}
          </div>
          <input
            className="winamp__vol"
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            title="Volume"
          />
        </div>

        <div className="winamp__playlist">
          <div className="winamp__playlist-header">Current Playlist</div>
          <ul>
            {TRACKS.map((t, i) => (
              <li
                key={t.videoId}
                className={i === trackIdx ? "is-active" : ""}
                onClick={() => setTrackIdx(i)}
              >
                {String(i + 1).padStart(2, "0")}. {t.title} — {t.artist}
              </li>
            ))}
          </ul>
        </div>

        <div className="winamp__statusbar">
          {ready ? "● ONLINE" : "○ loading…"} · {TRACKS.length} tracks · vol {volume}%
        </div>
      </div>

      {/* Marquee */}
      <div className="y2k-marquee">
        <div className="y2k-marquee__track">
          ✦ welcome 2 my crib ✦ keep it real ✦ no posers ✦ est. 2003 ✦ ☠ ☢ ☮ ★ ♥ ✦ system online ✦ all rights reversed ✦ keep it real ✦ no posers ✦ est. 2003 ✦
        </div>
      </div>
    </div>
  );
}
