import { useEffect, useRef } from "react";

type Bubble = {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
};

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

    const bubbles: Bubble[] = [];

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    };

    const spawnBubbles = (x: number, y: number) => {
      const count = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.className = "aero-bubble";
        const size = 10 + Math.random() * 22;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        document.body.appendChild(el);

        const b: Bubble = {
          el,
          x: x + (Math.random() - 0.5) * 18,
          y: y + (Math.random() - 0.5) * 18,
          vx: (Math.random() - 0.5) * 0.04,
          vy: -(0.04 + Math.random() * 0.06), // very slow upward drift
          r: size / 2,
          life: 0,
          maxLife: 16000 + Math.random() * 8000,
        };
        bubbles.push(b);
      }
    };

    const handleClick = (e: MouseEvent) => {
      cursor.classList.remove("aero-cursor--pulse");
      void cursor.offsetWidth;
      cursor.classList.add("aero-cursor--pulse");
      spawnBubbles(e.clientX, e.clientY);
    };

    let lastT = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(48, t - lastT);
      lastT = t;

      // Trailing dot
      dotX += (mouseX - dotX) * 0.18;
      dotY += (mouseY - dotY) * 0.18;
      dot.style.left = `${dotX}px`;
      dot.style.top = `${dotY}px`;

      // Bubble physics: very slow upward float + bubble-bubble collisions
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.life += dt;
        // tiny horizontal jitter (water current)
        b.vx += (Math.random() - 0.5) * 0.0008;
        b.vx *= 0.99;
        // very gentle upward acceleration
        b.vy += -0.0003 * dt;
        if (b.vy < -0.25) b.vy = -0.25;
        if (b.vx > 0.15) b.vx = 0.15;
        if (b.vx < -0.15) b.vx = -0.15;

        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }

      // Pairwise collisions (bouncy, equal mass)
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const a = bubbles[i];
          const c = bubbles[j];
          const dx = c.x - a.x;
          const dy = c.y - a.y;
          const dist = Math.hypot(dx, dy);
          const min = a.r + c.r;
          if (dist > 0 && dist < min) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (min - dist) / 2;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            c.x += nx * overlap;
            c.y += ny * overlap;

            // relative velocity along normal
            const dvx = c.vx - a.vx;
            const dvy = c.vy - a.vy;
            const vn = dvx * nx + dvy * ny;
            if (vn < 0) {
              const restitution = 1.0;
              const impulse = -(1 + restitution) * vn * 0.5;
              a.vx -= impulse * nx;
              a.vy -= impulse * ny;
              c.vx += impulse * nx;
              c.vy += impulse * ny;
            }
          }
        }
      }

      // Render + cull
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        const lifeRatio = b.life / b.maxLife;
        // fade in fast, hold, fade out near end
        let opacity = 1;
        if (lifeRatio < 0.08) opacity = lifeRatio / 0.08;
        else if (lifeRatio > 0.85) opacity = (1 - lifeRatio) / 0.15;
        b.el.style.left = `${b.x}px`;
        b.el.style.top = `${b.y}px`;
        b.el.style.opacity = `${Math.max(0, Math.min(1, opacity))}`;

        if (b.y + b.r < -20 || b.life > b.maxLife) {
          b.el.remove();
          bubbles.splice(i, 1);
        }
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("click", handleClick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleClick);
      bubbles.forEach((b) => b.el.remove());
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="aero-cursor" />
      <div ref={dotRef} className="aero-cursor-dot" />
    </>
  );
}
