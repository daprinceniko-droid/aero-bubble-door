import { useEffect, useRef } from "react";

export function AeroCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    const spawnBubbles = (x: number, y: number) => {
      const count = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const bubble = document.createElement("div");
        bubble.className = "aero-bubble";
        const size = 8 + Math.random() * 22;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${x + (Math.random() - 0.5) * 20}px`;
        bubble.style.top = `${y + (Math.random() - 0.5) * 20}px`;
        bubble.style.setProperty(
          "--drift",
          `${(Math.random() - 0.5) * 120}px`,
        );
        bubble.style.animationDuration = `${1.2 + Math.random() * 0.9}s`;
        document.body.appendChild(bubble);
        setTimeout(() => bubble.remove(), 2200);
      }
    };

    const handleClick = (e: MouseEvent) => {
      spawnBubbles(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return <div ref={cursorRef} className="aero-cursor" />;
}
