import { useEffect, useState } from "react";

export type Ticker = { price: number; changePct: number; live: boolean };

/**
 * Last BTC/USD price and its 24h change, for the hero's trading scenery.
 *
 * Read-only public endpoints, no keys, nothing about the visitor is sent:
 * Binance first (BTCUSDT 24h ticker), Coinbase Exchange stats if Binance is
 * unreachable from the visitor's region, and a fixed recent value if both
 * fail - the scenery must never show an empty quote. Refreshed once a minute
 * while the tab is visible.
 */
const FALLBACK: Ticker = { price: 80578.08, changePct: -1.35, live: false };
const REFRESH_MS = 60_000;

async function withTimeout<T>(p: (signal: AbortSignal) => Promise<T>, ms = 4000): Promise<T> {
  const ctl = new AbortController();
  const t = window.setTimeout(() => ctl.abort(), ms);
  try {
    return await p(ctl.signal);
  } finally {
    window.clearTimeout(t);
  }
}

async function fromBinance(): Promise<Ticker> {
  return withTimeout(async (signal) => {
    const r = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT", { signal });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    const price = Number(j.lastPrice);
    const changePct = Number(j.priceChangePercent);
    if (!Number.isFinite(price) || !Number.isFinite(changePct)) throw new Error("bad payload");
    return { price, changePct, live: true };
  });
}

async function fromCoinbase(): Promise<Ticker> {
  return withTimeout(async (signal) => {
    const r = await fetch("https://api.exchange.coinbase.com/products/BTC-USD/stats", { signal });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    const price = Number(j.last);
    const open = Number(j.open);
    if (!Number.isFinite(price) || !Number.isFinite(open) || open <= 0) throw new Error("bad payload");
    return { price, changePct: ((price - open) / open) * 100, live: true };
  });
}

export function useBtcTicker(): Ticker {
  const [ticker, setTicker] = useState<Ticker>(FALLBACK);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (document.visibilityState === "hidden") return;
      for (const source of [fromBinance, fromCoinbase]) {
        try {
          const t = await source();
          if (alive) setTicker(t);
          return;
        } catch {
          /* try the next source; the fallback stays on screen */
        }
      }
    };
    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  return ticker;
}

export function formatPrice(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
