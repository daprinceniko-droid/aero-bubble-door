import { useEffect, useRef, useState } from "react";

export function XpCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let rafId = 0;
    let queued = false;

    const update = () => {
      ring.style.transform = `translate3d(${mouseX - 2}px, ${mouseY - 2}px, 0)`;
      queued = false;
    };

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!queued) {
        queued = true;
        rafId = requestAnimationFrame(update);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const id = ++idRef.current;
      setRipples((r) => [...r, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setRipples((r) => r.filter((rp) => rp.id !== id));
      }, 700);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("click", handleClick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="xp-cursor">
        <svg width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 2 L4 24 L10 19 L13.5 27.5 L17 26 L13.5 17.5 L21 17 Z"
            fill="#ffd700"
            stroke="#000"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {ripples.map((r) => (
        <div
          key={r.id}
          className="xp-cursor-ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </>
  );
}
