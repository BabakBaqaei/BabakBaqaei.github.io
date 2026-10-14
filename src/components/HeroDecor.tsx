import "@fontsource/jetbrains-mono/400.css";

/**
 * The faint scenery behind each shoulder, in the 1920x1080 coordinates of the
 * hero frame (the SVG's viewBox is that frame, drawn into the same
 * cover-sized box as the portrait).
 *
 *   left   coding + trading - mono code, a pair quote, a small candle chart
 *   right  the hotel        - one line-drawn grand hotel under five stars
 *
 * Placed against the measured shoulder line (source px): left shoulder rises
 * from (440, 805) to (710, 693), right from (1190, 683) to (1490, 808). The
 * code lines run on until the neck covers them, the candle chart sinks behind
 * the shoulder, and the hotel's base and near wing sit behind the neck and
 * shoulder (the illustration's paint splash owns the low outer shoulder), so both read as *behind* the
 * person, as in the reference. The layer drifts less than the person
 * (HeroLayers), so the overlap shifts with the cursor.
 *
 * Violet-tinted greys a little darker than the paper: texture, not content.
 * Each side fades with its own label (`--op-left` / `--op-right`).
 */
const MONO = "'JetBrains Mono', ui-monospace, monospace";

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
  [19, 23, 24, 18],
  [23, 27, 28, 22],
  [27, 25, 29, 24],
  [25, 30, 31, 24],
];

function CandleChart({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
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
      {[0.33, 0.66].map((f) => (
        <line key={f} x1={x} x2={x + w} y1={y + h * f} y2={y + h * f} stroke={FAINT} strokeWidth={1} strokeDasharray="2 6" />
      ))}
      {CANDLES.map(([o, c, hgh, low], i) => {
        const cx = x + step * i + step / 2;
        const up = c >= o;
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={py(hgh)} y2={py(low)} stroke={SOFT} strokeWidth={1.5} />
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
      <polyline points={ma} fill="none" stroke={ACCENT} strokeOpacity={0.45} strokeWidth={2} />
    </g>
  );
}

/** Five-point star centred on (cx, cy). */
function star(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

/**
 * A grand hotel, line-drawn: two wings and a central tower, a cornice per
 * block, a window grid, a canopied entrance, a flag, five stars on an arc.
 * Local origin is the bottom-left of the building; y grows downward as usual.
 */
function GrandHotel({ x, y }: { x: number; y: number }) {
  const floors = 6;
  const floorH = 34;
  const top = -floors * floorH - 18; // main block roof
  const windows: { x: number; y: number }[] = [];
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < 11; c++) {
      const wx = 46 + c * 22;
      const wy = -28 - f * floorH - 16;
      // keep the entrance bay clear on the ground floor
      if (f === 0 && wx > 128 && wx < 196) continue;
      windows.push({ x: wx, y: wy });
    }
  }
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={SOFT} strokeWidth={1.5} strokeLinejoin="round">
      {/* stars on an arc over the tower */}
      {[-2, -1, 0, 1, 2].map((k) => (
        <polygon
          key={k}
          points={star(160 + k * 30, top - 128 + Math.abs(k) * 7, 10)}
          fill={k === 0 ? ACCENT : SOFT}
          fillOpacity={k === 0 ? 0.55 : 1}
          stroke="none"
        />
      ))}
      {/* flag */}
      <line x1={160} x2={160} y1={top - 62} y2={top - 100} />
      <path d="M 160 -100 l 22 6 l -22 6 z" transform={`translate(0 ${top})`} fill={FAINT} />
      {/* central tower */}
      <rect x={118} y={top - 62} width={84} height={62} />
      <path d={`M 112 ${top - 62} L 160 ${top - 82} L 208 ${top - 62}`} />
      <circle cx={160} cy={top - 38} r={11} />
      <line x1={160} x2={160} y1={top - 44} y2={top - 38} />
      <line x1={160} x2={166} y1={top - 38} y2={top - 38} />
      {/* main block + cornices */}
      <rect x={30} y={top} width={260} height={-top} />
      <line x1={22} x2={298} y1={top} y2={top} strokeWidth={2.5} />
      <line x1={30} x2={290} y1={top + 14} y2={top + 14} stroke={FAINT} />
      {[1, 2, 3, 4, 5].map((f) => (
        <line key={f} x1={30} x2={290} y1={-f * floorH - 10} y2={-f * floorH - 10} stroke={FAINT} strokeWidth={1} />
      ))}
      {/* windows */}
      {windows.map((w, i) => (
        <rect key={i} x={w.x} y={w.y} width={10} height={16} rx={1} stroke={FAINT} />
      ))}
      {/* entrance: canopy, doors, sign */}
      <path d="M 120 -44 L 200 -44 L 192 -34 L 128 -34 Z" fill={FAINT} />
      <line x1={132} x2={132} y1={-34} y2={0} />
      <line x1={188} x2={188} y1={-34} y2={0} />
      <path d="M 146 0 L 146 -22 A 14 14 0 0 1 174 -22 L 174 0" />
      <text
        x={160}
        y={-54}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={11}
        letterSpacing={5}
        fill={SOFT}
        stroke="none"
      >
        HOTEL
      </text>
      {/* ground */}
      <line x1={-10} x2={330} y1={0} y2={0} strokeWidth={2} />
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
      {/* ---- left: coding + trading, running in behind the shoulder ---- */}
      <g
        style={{
          opacity: "var(--op-left, 1)",
          transition: "opacity var(--dur-left, 160ms) linear",
        }}
        fontFamily={MONO}
      >
        <text x={372} y={604} fontSize={17} fill={FAINT}>
          {"if (rsi(14) < 30 && trend.up) enter(\"long\");"}
        </text>
        <text x={336} y={640} fontSize={17} fill={SOFT}>
          {"const edge = winRate * rr - (1 - winRate);"}
        </text>
        <text x={392} y={708} fontSize={40} fill={FAINT} letterSpacing={-1}>
          EUR/USD
        </text>
        <text x={394} y={736} fontSize={16} fill={SOFT}>
          1.0842
          <tspan fill={ACCENT} fillOpacity={0.6} dx={10}>
            ▲ 0.31%
          </tspan>
        </text>
        <CandleChart x={588} y={664} w={170} h={86} />
      </g>

      {/* ---- right: the hotel, its base and near wing behind the shoulder ---- */}
      <g
        style={{
          opacity: "var(--op-right, 1)",
          transition: "opacity var(--dur-right, 160ms) linear",
        }}
      >
        <GrandHotel x={1236} y={880} />
      </g>
    </svg>
  );
}
