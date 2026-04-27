import { useEffect, useRef, useState } from "react";

export function XpCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    const handleMove = (e: MouseEvent) => {
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
    };

    const handleClick = (e: MouseEvent) => {
      const id = ++idRef.current;
      setRipples((r) => [...r, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples((r) => r.filter((rp) => rp.id !== id));
      }, 700);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      {/* Yellow XP-style arrow cursor (SVG) */}
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
