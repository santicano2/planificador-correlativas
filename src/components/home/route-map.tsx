export function RouteMap() {
  return (
    <div
      aria-hidden="true"
      className="border border-line bg-surface p-3"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
        <span className="route-badge text-primary">Red local</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
          PDF → Tablero
        </span>
      </div>

      <svg viewBox="0 0 480 154" className="mt-2 w-full">
        <path
          d="M44 50H404"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="4"
        />
        <path
          d="M404 50V112H300"
          fill="none"
          stroke="var(--color-line-strong)"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
        <path
          d="M404 112H452"
          fill="none"
          stroke="var(--color-line-strong)"
          strokeWidth="2"
          strokeDasharray="5 5"
        />

        {[
          { x: 44, label: "PDF", detail: "Tu plan" },
          { x: 224, label: "Revisión", detail: "Corregí" },
          { x: 404, label: "Tablero", detail: "Decidí" },
        ].map((station, index) => (
          <g key={station.label}>
            <circle
              cx={station.x}
              cy="50"
              r="9"
              fill={index === 0 ? "var(--color-primary)" : "var(--color-surface)"}
              stroke="var(--color-primary)"
              strokeWidth="4"
            />
            <text
              x={station.x}
              y="80"
              textAnchor="middle"
              fill="var(--color-ink)"
              fontSize="15"
              fontWeight="600"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {station.label}
            </text>
            <text
              x={station.x}
              y="96"
              textAnchor="middle"
              fill="var(--color-ink-soft)"
              fontSize="10"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {station.detail}
            </text>
          </g>
        ))}

        <circle
          cx="300"
          cy="112"
          r="5"
          fill="var(--color-surface)"
          stroke="var(--color-line-strong)"
          strokeWidth="2"
        />
        <circle
          cx="452"
          cy="112"
          r="5"
          fill="var(--color-surface)"
          stroke="var(--color-line-strong)"
          strokeWidth="2"
        />
        <text
          x="300"
          y="134"
          textAnchor="middle"
          fill="var(--color-ink-soft)"
          fontSize="10"
          fontWeight="600"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Cuatrimestre
        </text>
        <text
          x="452"
          y="134"
          textAnchor="middle"
          fill="var(--color-ink-soft)"
          fontSize="10"
          fontWeight="600"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Grafo
        </text>
      </svg>
    </div>
  );
}
