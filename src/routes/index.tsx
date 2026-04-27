import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AeroCursor } from "@/components/AeroCursor";
import { XpCursor } from "@/components/XpCursor";
import { Y2KPlaceholder } from "@/components/Y2KPlaceholder";

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
        href: "https://fonts.googleapis.com/css2?family=Audiowide&family=Bungee&family=Special+Elite&family=VT323&display=swap",
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

            {/* Hide foreground content once flipped */}
            <div
              className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-5 px-6 transition-opacity duration-300"
              style={{
                opacity: flipped ? 0 : 1,
                pointerEvents: flipped ? "none" : "auto",
              }}
            >
              <h1
                className="invert-text text-center leading-none tracking-[0.3em]"
                style={{
                  fontFamily: "'Audiowide', system-ui, sans-serif",
                  color: "#50280c",
                  fontSize: "15px",
                }}
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

        {/* BACK - Y2K grunge placeholder */}
        <div className="flip-face flip-face--back">
          <Y2KPlaceholder />
        </div>
      </div>

      {showFlash && <div className="flip-flash" />}
      <AeroCursor />
    </div>
  );
}
