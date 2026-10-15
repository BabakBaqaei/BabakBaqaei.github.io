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
 * An Art Deco grand hotel, line-drawn on one strict grid so nothing collides:
 *
 *   - every floor is a FLOOR-high band; a window sits centred in its band
 *     (7px clear above and below), and the floor lines fall exactly on the
 *     band boundaries - between windows, never through them;
 *   - two five-storey wings and an eight-storey central tower, each with its
 *     own cornice, the tower stepping up to a crown and a spire;
 *   - fine vertical fins between the tower's window columns (the Deco
 *     rhythm), an entrance with a canopy and an arched door in the tower's
 *     ground floor, the name in the crown, five stars on an arc above.
 *
 * Local origin is the bottom-left of the building, y up is negative.
 */
const FLOOR = 30;
const WIN_W = 10;
const WIN_H = 16;

type Block = { x: number; w: number; floors: number; cols: number[] };

const LEFT_WING: Block = { x: 0, w: 96, floors: 5, cols: [10, 32, 54, 76] };
const RIGHT_WING: Block = { x: 244, w: 96, floors: 5, cols: [10, 32, 54, 76] };
const TOWER: Block = { x: 96, w: 148, floors: 8, cols: [13, 41, 69, 97, 125] };

/** Ground-floor tower bays kept clear for the entrance. */
const ENTRANCE_COLS = new Set([41, 69, 97]);

function BlockFacade({ b, entrance = false }: { b: Block; entrance?: boolean }) {
  // The tower carries the crown instead of a parapet (they would overlap).
  const top = -b.floors * FLOOR;
  return (
    <g>
      <rect x={b.x} y={top} width={b.w} height={-top} />
      {/* cornice + parapet */}
      <line x1={b.x - 5} x2={b.x + b.w + 5} y1={top} y2={top} strokeWidth={2.4} />
      {!entrance && <rect x={b.x + 4} y={top - 7} width={b.w - 8} height={7} stroke={FAINT} />}
      {/* floor lines on the band boundaries */}
      {Array.from({ length: b.floors - 1 }, (_, i) => -(i + 1) * FLOOR).map((y) => (
        <line key={y} x1={b.x} x2={b.x + b.w} y1={y} y2={y} stroke={FAINT} strokeWidth={1} />
      ))}
      {/* windows, centred in each band */}
      {Array.from({ length: b.floors }, (_, f) =>
        b.cols.map((c) => {
          if (entrance && f === 0 && ENTRANCE_COLS.has(c)) return null;
          const y = -(f + 1) * FLOOR + (FLOOR - WIN_H) / 2;
          return (
            <rect
              key={`${f}-${c}`}
              x={b.x + c}
              y={y}
              width={WIN_W}
              height={WIN_H}
              rx={f === b.floors - 1 ? 5 : 1}
              stroke={FAINT}
              strokeWidth={1.2}
            />
          );
        }),
      )}
    </g>
  );
}

function GrandHotel({ x, y }: { x: number; y: number }) {
  const towerTop = -TOWER.floors * FLOOR; // -240
  const cx = TOWER.x + TOWER.w / 2; // 170
  // Vertical fins between the tower's window columns, above the ground floor.
  const fins = TOWER.cols.slice(0, -1).map((c, i) => TOWER.x + (c + WIN_W + TOWER.cols[i + 1]) / 2);

  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={SOFT} strokeWidth={1.5} strokeLinejoin="round">
      {/* five stars on an arc over the spire */}
      {[-2, -1, 0, 1, 2].map((k) => (
        <polygon
          key={k}
          points={star(cx + k * 24, towerTop - 112 + Math.abs(k) * 6, k === 0 ? 9 : 8)}
          fill={k === 0 ? ACCENT : SOFT}
          fillOpacity={k === 0 ? 0.6 : 1}
          stroke="none"
        />
      ))}

      {/* crown: two steps and a spire */}
      <rect x={TOWER.x + 20} y={towerTop - 24} width={TOWER.w - 40} height={24} />
      <rect x={TOWER.x + 44} y={towerTop - 44} width={TOWER.w - 88} height={20} />
      <path d={`M ${cx - 10} ${towerTop - 44} L ${cx} ${towerTop - 80} L ${cx + 10} ${towerTop - 44}`} />
      <line x1={cx} x2={cx} y1={towerTop - 80} y2={towerTop - 90} />
      <text
        x={cx}
        y={towerTop - 8}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={10}
        letterSpacing={5}
        fill={SOFT}
        stroke="none"
      >
        HOTEL
      </text>

      <BlockFacade b={LEFT_WING} />
      <BlockFacade b={RIGHT_WING} />
      <BlockFacade b={TOWER} entrance />

      {fins.map((fx) => (
        <line key={fx} x1={fx} x2={fx} y1={towerTop + 4} y2={-FLOOR} stroke={FAINT} strokeWidth={0.9} />
      ))}

      {/* entrance: canopy over an arched door */}
      <path d={`M ${cx - 34} ${-FLOOR + 6} L ${cx + 34} ${-FLOOR + 6} L ${cx + 28} ${-FLOOR + 12} L ${cx - 28} ${-FLOOR + 12} Z`} fill={FAINT} />
      <path d={`M ${cx - 11} 0 L ${cx - 11} -10 A 11 11 0 0 1 ${cx + 11} -10 L ${cx + 11} 0`} />
      <line x1={cx} x2={cx} y1={-18} y2={0} stroke={FAINT} />

      {/* plinth and ground line */}
      <line x1={-12} x2={352} y1={0} y2={0} strokeWidth={2} />
      <line x1={-24} x2={364} y1={6} y2={6} stroke={FAINT} />
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
