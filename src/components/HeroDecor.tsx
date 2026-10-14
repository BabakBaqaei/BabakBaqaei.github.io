import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/playfair-display/400-italic.css";

/**
 * The faint scenery behind each shoulder, in the 1920x1080 coordinates of the
 * hero frame (the SVG's viewBox is that frame, drawn into the same
 * cover-sized box as the portrait, so it stays put relative to the body).
 *
 *   left   coding + trading - mono code, a pair quote, a small candle chart
 *   right  the hotel        - italic serif, the house's numbers, a service bell
 *
 * Deliberately quiet: violet-tinted greys a little darker than the paper, so
 * they read as texture and never compete with the role labels or the face.
 * Each side fades with its own label (`--op-left` / `--op-right`).
 */
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const SERIF = "'Playfair Display', Georgia, serif";

/** Ink for the scenery: violet-tinted greys, light enough to stay texture. */
const FAINT = "#D6D1E4";
const SOFT = "#C7C0DC";
const ACCENT = "#A98BFF";

// A short, believable session: higher lows, a pullback, a breakout.
const CANDLES: ReadonlyArray<readonly [number, number, number, number]> = [
  // open, close, high, low (price units; chart maps them to y)
  [10, 14, 15, 9],
  [14, 12, 15, 11],
  [12, 17, 18, 11],
  [17, 16, 19, 15],
  [16, 21, 22, 15],
  [21, 19, 22, 18],
  [19, 18, 20, 16],
  [18, 23, 24, 17],
  [23, 27, 28, 22],
  [27, 25, 29, 24],
  [25, 30, 31, 24],
];

function CandleChart({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const lo = 8;
  const hi = 32;
  const py = (v: number) => y + h - ((v - lo) / (hi - lo)) * h;
  const step = w / CANDLES.length;
  const body = step * 0.46;
  const ma = CANDLES.map((_, i) => {
    const win = CANDLES.slice(Math.max(0, i - 2), i + 1);
    const avg = win.reduce((s, c) => s + c[1], 0) / win.length;
    return `${(x + step * i + step / 2).toFixed(1)},${py(avg).toFixed(1)}`;
  }).join(" ");

  return (
    <g>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={x}
          x2={x + w}
          y1={y + h * f}
          y2={y + h * f}
          stroke={FAINT}
          strokeWidth={1}
          strokeDasharray="2 6"
        />
      ))}
      {CANDLES.map(([o, c, hgh, low], i) => {
        const cx = x + step * i + step / 2;
        const up = c >= o;
        return (
          <g key={i}>
            <line
              x1={cx}
              x2={cx}
              y1={py(hgh)}
              y2={py(low)}
              stroke={SOFT}
              strokeWidth={1.5}
            />
            <rect
              x={cx - body / 2}
              y={py(Math.max(o, c))}
              width={body}
              height={Math.max(2, Math.abs(py(o) - py(c)))}
              fill={up ? "none" : SOFT}
              stroke={SOFT}
              strokeWidth={1.5}
            />
          </g>
        );
      })}
      <polyline
        points={ma}
        fill="none"
        stroke={ACCENT}
        strokeOpacity={0.45}
        strokeWidth={2}
      />
    </g>
  );
}

/** Line drawing of a front-desk service bell. */
function ServiceBell({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s})`}
      fill="none"
      stroke={SOFT}
      strokeWidth={1.6 / s}
      strokeLinecap="round"
    >
      <path d="M -50 0 A 50 50 0 0 1 50 0" />
      <line x1={-62} x2={62} y1={0} y2={0} />
      <line x1={-70} x2={70} y1={12} y2={12} />
      <line x1={0} x2={0} y1={-50} y2={-60} />
      <line x1={-9} x2={9} y1={-62} y2={-62} />
      <path d="M -28 -28 A 36 36 0 0 1 -8 -40" strokeOpacity={0.7} />
    </g>
  );
}

export function HeroDecor() {
  return (
    <svg
      viewBox="0 0 1920 1080"
      aria-hidden
      className="absolute inset-0 h-full w-full select-none"
      style={{ pointerEvents: "none" }}
    >
      {/* ---- left: coding + trading ---- */}
      <g
        style={{
          opacity: "var(--op-left, 1)",
          transition: "opacity var(--dur-left, 160ms) linear",
        }}
        fontFamily={MONO}
      >
        <text x={150} y={492} fontSize={17} fill={SOFT}>
          {"const edge = winRate * rr - (1 - winRate);"}
        </text>
        <text x={190} y={530} fontSize={17} fill={FAINT}>
          {'if (rsi(14) < 30 && trend.up) enter("long");'}
        </text>
        <text x={150} y={606} fontSize={46} fill={FAINT} letterSpacing={-1}>
          EUR/USD
        </text>
        <text x={152} y={638} fontSize={18} fill={SOFT}>
          1.0842
          <tspan fill={ACCENT} fillOpacity={0.6} dx={10}>
            ▲ 0.31%
          </tspan>
        </text>
        <CandleChart x={150} y={664} w={250} h={112} />
        <text x={150} y={814} fontSize={15} fill={FAINT}>
          {'{ sl: 1.0790, tp: 1.0950, risk: "1%" }'}
        </text>
      </g>

      {/* ---- right: the hotel ---- */}
      <g
        style={{
          opacity: "var(--op-right, 1)",
          transition: "opacity var(--dur-right, 160ms) linear",
        }}
      >
        <text
          x={1780}
          y={500}
          fontFamily={SERIF}
          fontStyle="italic"
          fontSize={28}
          fill={SOFT}
          textAnchor="end"
        >
          Good evening, welcome home.
        </text>
        <text
          x={1780}
          y={582}
          fontFamily={SERIF}
          fontStyle="italic"
          fontSize={64}
          fill={FAINT}
          textAnchor="end"
        >
          Suite 1204
        </text>
        <text
          x={1780}
          y={624}
          fontFamily={MONO}
          fontSize={14}
          fill={SOFT}
          textAnchor="end"
          letterSpacing={3}
        >
          CHECK-IN 14:00 · CHECK-OUT 12:00
        </text>
        <text
          x={1780}
          y={664}
          fontSize={20}
          fill={SOFT}
          textAnchor="end"
          letterSpacing={6}
        >
          ★★★★★
        </text>
        <text
          x={1780}
          y={790}
          fontFamily={MONO}
          fontSize={14}
          fill={SOFT}
          textAnchor="end"
          letterSpacing={2}
        >
          OCC 92% · ADR $410 · RevPAR $377
        </text>
        <ServiceBell x={1665} y={745} s={0.9} />
      </g>
    </svg>
  );
}
