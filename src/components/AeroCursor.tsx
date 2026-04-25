import { useEffect, useRef } from "react";

export function AeroCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let rafId = 0;

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    };

    const tick = () => {
      // Trailing dot - smooth follow with easing
      dotX += (mouseX - dotX) * 0.18;
      dotY += (mouseY - dotY) * 0.18;
      dot.style.left = `${dotX}px`;
      dot.style.top = `${dotY}px`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const spawnBubbles = (x: number, y: number) => {
      const count = 10 + Math.floor(Math.random() * 6);
      for (let i = 0; i < count; i++) {
        const bubble = document.createElement("div");
        bubble.className = "aero-bubble";
        const size = 6 + Math.random() * 18;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${x + (Math.random() - 0.5) * 24}px`;
        bubble.style.top = `${y + (Math.random() - 0.5) * 24}px`;
        bubble.style.setProperty(
          "--drift",
          `${(Math.random() - 0.5) * 160}px`,
        );
        // Float to leave screen - distance is from spawn point to top
        const rise = y + 80;
        bubble.style.setProperty("--rise", `-${rise}px`);
        bubble.style.setProperty(
          "--scale-end",
          `${0.7 + Math.random() * 0.9}`,
        );
        // Slow float, varied per bubble
        bubble.style.animationDuration = `${3.5 + Math.random() * 3}s`;
        bubble.style.animationDelay = `${Math.random() * 0.15}s`;
        document.body.appendChild(bubble);
        setTimeout(() => bubble.remove(), 7000);
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Cursor pulse effect (size change)
      cursor.classList.remove("aero-cursor--pulse");
      // force reflow to restart animation
      void cursor.offsetWidth;
      cursor.classList.add("aero-cursor--pulse");
      spawnBubbles(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("click", handleClick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="aero-cursor" />
      <div ref={dotRef} className="aero-cursor-dot" />
    </>
  );
}
