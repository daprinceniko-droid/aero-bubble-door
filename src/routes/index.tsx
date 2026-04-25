import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AeroCursor } from "@/components/AeroCursor";
import { MatrixRain } from "@/components/MatrixRain";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Are You Ready?" },
      {
        name: "description",
        content: "Step into the sky. A Frutiger Aero experience.",
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Audiowide&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playbackRate = 0.5;
    v.play().catch(() => {});
  }, []);

  const handleEnter = () => {
    if (flipped) return;
    setShowFlash(true);
    setFlipped(true);
    setTimeout(() => setShowFlash(false), 1400);
  };

  return (
    <div className="flip-stage min-h-screen w-full overflow-hidden bg-black">
      <div className={`flip-card ${flipped ? "is-flipped" : ""}`}>
        {/* FRONT - Frutiger Aero clouds */}
        <div className="flip-face flip-face--front">
          <main className="relative min-h-screen w-full overflow-hidden bg-black">
            <video
              ref={videoRef}
              src="/clouds.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-6">
              <h1
                className="invert-text text-center text-2xl leading-none tracking-[0.25em] sm:text-3xl"
                style={{ fontFamily: "'Audiowide', system-ui, sans-serif" }}
              >
                are you ready
              </h1>

              <button
                type="button"
                className="aero-button"
                onClick={handleEnter}
              >
                Enter
              </button>
            </div>
          </main>
        </div>

        {/* BACK - Matrix placeholder */}
        <div className="flip-face flip-face--back">
          {flipped && <MatrixRain />}
          <div className="matrix-overlay">
            <p>// system online</p>
            <h2>Welcome</h2>
            <p>placeholder screen</p>
          </div>
        </div>
      </div>

      {showFlash && <div className="flip-flash" />}
      <AeroCursor />
    </div>
  );
}
