import { useState } from "react";

const projects = [
  { title: "Project One", description: "Placeholder description for the first project." },
  { title: "Project Two", description: "Placeholder description for the second project." },
  { title: "Project Three", description: "Placeholder description for the third project." },
  { title: "Project Four", description: "Placeholder description for the fourth project." },
  { title: "Project Five", description: "Placeholder description for the fifth project." },
];

export function ProjectsCanvas() {
  const [index, setIndex] = useState(0);
  const total = projects.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "64px 24px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#111",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          fontWeight: 700,
          letterSpacing: "0.02em",
          marginBottom: "48px",
        }}
      >
        Projects
      </h1>

      <div
        style={{
          position: "relative",
          width: "min(1100px, 100%)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button
          onClick={prev}
          aria-label="Previous"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "1px solid #ddd",
            background: "#fafafa",
            cursor: "pointer",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          ←
        </button>

        <div style={{ flex: 1, overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              transform: `translateX(-${index * 100}%)`,
              transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {projects.map((p, i) => (
              <div
                key={i}
                style={{
                  flex: "0 0 100%",
                  padding: "0 12px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    background: "#f5f5f5",
                    border: "1px solid #e5e5e5",
                    borderRadius: 16,
                    height: 360,
                    padding: 32,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 14, color: "#888", marginBottom: 8 }}>
                    {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </div>
                  <h2 style={{ fontSize: 32, fontWeight: 600, margin: "0 0 12px" }}>
                    {p.title}
                  </h2>
                  <p style={{ fontSize: 16, color: "#555", maxWidth: 480 }}>
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={next}
          aria-label="Next"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "1px solid #ddd",
            background: "#fafafa",
            cursor: "pointer",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          →
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 32 }}>
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              border: "none",
              background: i === index ? "#111" : "#ccc",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
