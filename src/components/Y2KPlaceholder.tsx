import { useEffect, useRef, useState } from "react";

const TRACKS = [
  "01. Synthwave Drifter",
  "02. Neon Sky",
  "03. Digital Waves",
  "04. Retro-Future Funk (Playing)",
  "05. Aero Grooves",
];

export function Y2KPlaceholder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(35);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.3));
    }, 200);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <div className="y2k-screen">
      <XpCursor />
      {/* Grunge texture overlays */}
      <div className="y2k-noise" />
      <div className="y2k-scratches" />
      <div className="y2k-vignette" />

      {/* Stickers - scattered */}
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

      {/* Grungy stamps */}
      <div className="y2k-stamp y2k-stamp--top">CLASSIFIED</div>
      <div className="y2k-stamp y2k-stamp--bottom">REJECT // 187</div>

      {/* Title */}
      <div className="y2k-title-wrap">
        <div className="y2k-title-bg" />
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

      {/* Winamp-style player */}
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
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="winamp__bar"
                style={{
                  height: `${20 + Math.abs(Math.sin(i * 0.6 + progress * 0.1)) * 70}%`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
          <div className="winamp__track-info">
            <div className="winamp__track">Track 04: Retro-Future Funk</div>
            <div className="winamp__artist">The Aero Collective</div>
            <div className="winamp__album">— Frutiger Nights —</div>
          </div>
        </div>

        <div className="winamp__controls">
          <button className="winamp__btn">⏮</button>
          <button
            className="winamp__btn winamp__btn--play"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? "▶" : "❚❚"}
          </button>
          <button className="winamp__btn">❚❚</button>
          <button className="winamp__btn">■</button>
          <button className="winamp__btn">⏭</button>
          <div className="winamp__progress">
            <div className="winamp__progress-fill" style={{ width: `${progress}%` }} />
            <div className="winamp__progress-thumb" style={{ left: `${progress}%` }} />
          </div>
          <div className="winamp__time">02:15 / 03:48</div>
          <div className="winamp__knob"><div className="winamp__knob-tick" /></div>
        </div>

        <div className="winamp__playlist">
          <div className="winamp__playlist-header">Current Playlist</div>
          <ul>
            {TRACKS.map((t, i) => (
              <li key={t} className={i === 3 ? "is-active" : ""}>{t}</li>
            ))}
          </ul>
          <div className="winamp__playlist-footer">
            <input className="winamp__search" placeholder="Search" />
            <button className="winamp__small-btn">Add</button>
            <button className="winamp__small-btn">Remove</button>
            <button className="winamp__small-btn">Clear</button>
          </div>
        </div>

        <div className="winamp__statusbar">15 tracks, 58:12 duration · CPU: 14%</div>
      </div>

      {/* Marquee bottom */}
      <div className="y2k-marquee">
        <div className="y2k-marquee__track">
          ✦ welcome 2 my crib ✦ keep it real ✦ no posers ✦ est. 2003 ✦ ☠ ☢ ☮ ★ ♥ ✦ system online ✦ all rights reversed ✦ keep it real ✦ no posers ✦ est. 2003 ✦
        </div>
      </div>
    </div>
  );
}
