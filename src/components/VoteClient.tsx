"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BallotItem = {
  id: string;
  title: string;
  bedrooms: number;
  sleeps: number;
  lodgingScore: number | null;
  destination: { shortName: string; slug: string; lodgingFeasibility: number };
};

export function VoteClient({
  ballot,
  initialOrder,
}: {
  ballot: BallotItem[];
  initialOrder: string[];
}) {
  const router = useRouter();
  const gated = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of ballot) {
      const key = b.destination.slug;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return ballot.filter(
      (b) => b.destination.lodgingFeasibility >= 10 && (counts.get(b.destination.slug) || 0) > 0
    );
  }, [ballot]);

  const [order, setOrder] = useState<string[]>(() => {
    if (initialOrder.length) return initialOrder.filter((id) => gated.some((g) => g.id === id));
    return gated.map((g) => g.id);
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function move(id: string, dir: -1 | 1) {
    setOrder((prev) => {
      const i = prev.indexOf(id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function submit() {
    setError("");
    setMsg("");
    const res = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lodgingIds: order }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Vote failed");
      return;
    }
    setMsg("Vote saved (Borda ranked preferences)");
    router.refresh();
  }

  if (!gated.length) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No ballot options yet. Destinations need at least one finalized qualifying lodging (≥7 real BR
        confirmed, sleeps 14+). Unconfirmed bedroom counts cannot be voted.
      </p>
    );
  }

  const byId = Object.fromEntries(gated.map((g) => [g.id, g]));

  return (
    <div className="space-y-4">
      <p className="text-sm text-amber-900/80">
        Rank lodgings (1st = top). Scores use Borda count. Destinations with zero qualifying lodging
        are gated. Public standings do not show who voted.
      </p>
      <ol className="space-y-2">
        {order.map((id, idx) => {
          const item = byId[id];
          if (!item) return null;
          return (
            <li
              key={id}
              className="flex items-center gap-3 rounded-xl border border-amber-100 bg-white px-3 py-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                {idx + 1}
              </span>
              <div className="flex-1">
                <div className="font-medium text-amber-950">{item.title}</div>
                <div className="text-xs text-amber-800/70">
                  {item.destination.shortName} · {item.bedrooms} BR · sleeps {item.sleeps}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded border border-amber-200 px-2 py-1 text-xs"
                  onClick={() => move(id, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded border border-amber-200 px-2 py-1 text-xs"
                  onClick={() => move(id, 1)}
                >
                  ↓
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {msg && <p className="text-sm text-teal-800">{msg}</p>}
      <button
        type="button"
        onClick={submit}
        className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800"
      >
        Submit ranking
      </button>
    </div>
  );
}
