import { useEffect, useRef, useState } from "react";

/**
 * Y2K-screen cursor effects.
 * The visible gold pointer itself is now a real CSS cursor (`/cursors/gold.cur`)
 * applied via `.y2k-screen` styles, so we no longer render an SVG follower.
 * We only keep the red click-ripple flourish.
 */
export function XpCursor() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const id = ++idRef.current;
      setRipples((r) => [...r, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setRipples((r) => r.filter((rp) => rp.id !== id));
      }, 700);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
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
