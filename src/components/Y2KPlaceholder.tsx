import { useEffect, useRef, useState, useCallback } from "react";

const TRACKS = [
  { title: "My Worst Enemy", artist: "Lit", videoId: "4vg7JoGGJic" },
  { title: "In The End", artist: "Linkin Park", videoId: "eVTXPUF4Oz4" },
  { title: "Last Resort", artist: "Papa Roach", videoId: "6jKSZG-MdhQ" },
  { title: "Chop Suey!", artist: "System Of A Down", videoId: "CSvFpBOe8eY" },
  { title: "Smells Like Teen Spirit", artist: "Nirvana", videoId: "hTWKbfoikeg" },
];

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

export function Y2KPlaceholder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);

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

  // Switch track when trackIdx changes
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    try {
      playerRef.current.loadVideoById(TRACKS[trackIdx].videoId);
    } catch {
      /* noop */
    }
  }, [trackIdx, ready]);

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
    <div className="y2k-screen">
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

      {/* Title */}
      <div className="y2k-title-wrap">
        <h1 className="y2k-title">About Me</h1>
        <div className="y2k-title-sub">::: enter the void :::</div>
      </div>

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
          <div className="winamp__viz">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={`winamp__bar ${playing ? "" : "winamp__bar--paused"}`}
                style={{
                  animationDelay: `${(i % 6) * 0.08}s`,
                  animationDuration: `${0.6 + (i % 4) * 0.15}s`,
                }}
              />
            ))}
          </div>
          <div className="winamp__track-info">
            <div className="winamp__track">{track.title}</div>
            <div className="winamp__artist">{track.artist}</div>
            <div className="winamp__album">— Frutiger Nights —</div>
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
          <div className="winamp__playlist-footer">
            <input className="winamp__search" placeholder="Search" />
            <button className="winamp__small-btn">Add</button>
            <button className="winamp__small-btn">Clear</button>
          </div>
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
