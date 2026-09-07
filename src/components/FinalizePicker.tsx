"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; title: string; qualifies: boolean; finalized: boolean; bedrooms: number };

export function FinalizePicker({ items }: { items: Item[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(
    items.filter((i) => i.finalized).map((i) => i.id).slice(0, 2)
  );
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  async function finalize() {
    setError("");
    setMsg("");
    if (selected.length !== 2) {
      setError("Select exactly 2 qualifying lodgings");
      return;
    }
    const res = await fetch("/api/lodgings/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lodgingIds: selected }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setMsg("Finalized 2 for the ballot");
    router.refresh();
  }

  if (!items.length) return <p className="text-sm text-amber-800/70">No submissions yet.</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-amber-900/80">
        Pick exactly <strong>2</strong> to finalize for the family ballot ({selected.length}/2).
      </p>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-3 rounded-xl border border-amber-100 bg-white px-3 py-2">
            <input
              type="checkbox"
              disabled={!i.qualifies && !selected.includes(i.id)}
              checked={selected.includes(i.id)}
              onChange={() => toggle(i.id)}
            />
            <div className="flex-1 text-sm">
              <div className="font-medium text-amber-950">{i.title}</div>
              <div className="text-xs text-amber-800/70">
                {i.bedrooms} BR · {i.qualifies ? "Qualifies" : "Does not qualify"} ·{" "}
                {i.finalized ? "Currently finalized" : "Not on ballot"}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {msg && <p className="text-sm text-teal-800">{msg}</p>}
      <button
        type="button"
        onClick={finalize}
        className="rounded-full bg-amber-800 px-4 py-2 text-sm text-white hover:bg-amber-900"
      >
        Finalize selected 2
      </button>
    </div>
  );
}
