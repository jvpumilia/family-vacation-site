"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Pending = {
  id: string;
  title: string;
  bedrooms: number;
  sleeps: number;
  qualifies: boolean;
  destination: { shortName: string };
};

type Settings = {
  primaryStart: string | null;
  primaryEnd: string | null;
  backupStart: string | null;
  backupEnd: string | null;
  votingOpen: boolean;
  bookBy: string;
};

export function AdminClient({
  pending,
  settings,
}: {
  pending: Pending[];
  settings: Settings | null;
}) {
  const router = useRouter();
  const [dates, setDates] = useState({
    primaryStart: settings?.primaryStart || "",
    primaryEnd: settings?.primaryEnd || "",
    backupStart: settings?.backupStart || "",
    backupEnd: settings?.backupEnd || "",
  });
  const [msg, setMsg] = useState("");

  async function score(id: string, qualifies: boolean) {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "score_lodging",
        lodgingId: id,
        qualifies,
        status: "scored",
        realBedroomsConfirmed: qualifies,
      }),
    });
    setMsg("Updated lodging");
    router.refresh();
  }

  async function saveDates() {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_settings", ...dates }),
    });
    setMsg("Dates saved");
    router.refresh();
  }

  async function setVoting(open: boolean) {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_voting", votingOpen: open }),
    });
    setMsg(open ? "Voting opened" : "Voting closed");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {msg && <p className="text-sm text-teal-800">{msg}</p>}

      <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-xl">Date windows</h2>
        <p className="text-xs text-amber-800/60">Book by {settings?.bookBy}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {(
            [
              ["primaryStart", "Primary start"],
              ["primaryEnd", "Primary end"],
              ["backupStart", "Backup start"],
              ["backupEnd", "Backup end"],
            ] as const
          ).map(([k, label]) => (
            <label key={k}>
              {label}
              <input
                type="date"
                className="mt-1 w-full rounded border border-amber-200 px-2 py-1"
                value={dates[k]}
                onChange={(e) => setDates({ ...dates, [k]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveDates}
            className="rounded-full bg-teal-700 px-4 py-2 text-sm text-white"
          >
            Save dates
          </button>
          <button
            type="button"
            onClick={() => setVoting(!(settings?.votingOpen ?? true))}
            className="rounded-full border border-amber-300 px-4 py-2 text-sm"
          >
            {settings?.votingOpen ? "Close voting" : "Open voting"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-xl">Pending score queue</h2>
        <ul className="mt-3 space-y-3">
          {pending.map((p) => (
            <li key={p.id} className="rounded-xl border border-amber-50 px-3 py-3 text-sm">
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-amber-800/70">
                {p.destination.shortName} · {p.bedrooms} BR · sleeps {p.sleeps}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="rounded bg-teal-700 px-3 py-1 text-xs text-white"
                  onClick={() => score(p.id, true)}
                >
                  Mark qualifies
                </button>
                <button
                  type="button"
                  className="rounded bg-red-700 px-3 py-1 text-xs text-white"
                  onClick={() => score(p.id, false)}
                >
                  Reject gate
                </button>
              </div>
            </li>
          ))}
          {!pending.length && <p className="text-sm text-amber-800/70">Queue clear.</p>}
        </ul>
      </section>
    </div>
  );
}
