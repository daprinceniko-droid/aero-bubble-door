import { useEffect, useRef } from "react";

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const fontSize = 16;
    let columns = Math.floor(width / fontSize);
    let drops: number[] = Array(columns).fill(1);

    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/\\|*+-=";

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array(columns).fill(1);
    };
    window.addEventListener("resize", handleResize);

    let rafId = 0;
    const draw = () => {
      // Aero green tint with trailing fade
      ctx.fillStyle = "rgba(0, 10, 4, 0.08)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "Audiowide", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Bright head
        ctx.fillStyle = "rgba(190, 255, 210, 0.95)";
        ctx.shadowColor = "rgba(110, 255, 161, 0.9)";
        ctx.shadowBlur = 8;
        ctx.fillText(text, x, y);

        // Trailing softer green
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(80, 220, 130, 0.6)";
        ctx.fillText(text, x, y - fontSize);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-bg" />;
}
