import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { AeroCursor } from "@/components/AeroCursor";

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

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  return (
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

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-12 px-6">
        <h1
          className="invert-text text-center text-6xl leading-none tracking-wider sm:text-8xl md:text-9xl"
          style={{ fontFamily: "'Audiowide', system-ui, sans-serif" }}
        >
          are you ready
        </h1>

        <button type="button" className="aero-button">
          Enter
        </button>
      </div>

      <AeroCursor />
    </main>
  );
}
