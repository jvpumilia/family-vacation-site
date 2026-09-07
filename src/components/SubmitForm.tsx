"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Dest = { id: string; shortName: string; name: string };

export function SubmitForm({ destinations }: { destinations: Dest[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [ogMsg, setOgMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    destinationId: destinations[0]?.id || "",
    title: "",
    source: "other",
    bedrooms: 8,
    bathrooms: 6,
    sleeps: 16,
    realBedroomsConfirmed: false,
    hasPool: true,
    hasGameRoom: true,
    hasTheater: false,
    parkingSpaces: 3,
    dualFridge: false,
    dualDishwasher: false,
    notes: "",
    imageUrl: "",
  });

  async function extractOg() {
    setOgMsg("Fetching…");
    const res = await fetch("/api/og", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (data.title) setForm((f) => ({ ...f, title: data.title }));
    if (data.image) setForm((f) => ({ ...f, imageUrl: data.image }));
    if (data.description) setForm((f) => ({ ...f, notes: data.description.slice(0, 400) }));
    setOgMsg(data.message || (data.ok ? "OG tags applied — verify bedrooms manually." : "Manual entry needed."));
    const lower = url.toLowerCase();
    if (lower.includes("airbnb")) setForm((f) => ({ ...f, source: "airbnb" }));
    else if (lower.includes("vrbo")) setForm((f) => ({ ...f, source: "vrbo" }));
    else setForm((f) => ({ ...f, source: "manager" }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/lodgings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, url }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Submit failed");
      return;
    }
    router.push("/me");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="flex-1 rounded-lg border border-amber-200 px-3 py-2 text-sm"
          placeholder="Paste Airbnb / VRBO / manager URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          type="url"
        />
        <button
          type="button"
          onClick={extractOg}
          className="rounded-full border border-teal-700 px-4 py-2 text-sm text-teal-800 hover:bg-teal-50"
        >
          Extract OG
        </button>
      </div>
      {ogMsg && <p className="text-xs text-amber-800/80">{ogMsg}</p>}

      <label className="block text-sm">
        Destination
        <select
          className="mt-1 w-full rounded-lg border border-amber-200 px-3 py-2"
          value={form.destinationId}
          onChange={(e) => setForm({ ...form, destinationId: e.target.value })}
        >
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.shortName}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        Title
        <input
          className="mt-1 w-full rounded-lg border border-amber-200 px-3 py-2"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["bedrooms", "Bedrooms"],
            ["bathrooms", "Baths"],
            ["sleeps", "Sleeps"],
            ["parkingSpaces", "Parking"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            {label}
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-amber-200 px-3 py-2"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
            />
          </label>
        ))}
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-2">
        {[
          ["realBedroomsConfirmed", "7+ real BR confirmed (no pullouts)"],
          ["hasPool", "Private / indoor pool"],
          ["hasGameRoom", "Game room"],
          ["hasTheater", "Theater"],
          ["dualFridge", "Dual fridge"],
          ["dualDishwasher", "Dual dishwasher"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form[key as keyof typeof form] as boolean}
              onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>

      <label className="block text-sm">
        Notes
        <textarea
          className="mt-1 w-full rounded-lg border border-amber-200 px-3 py-2"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </label>

      <p className="text-xs text-amber-800/70">
        Hard rules: ≥7 enclosed bedrooms, sleeps 14+, prefer 6+ baths & parking for 3 cars. Listing enters{" "}
        <em>pending score</em> queue. Public cards never show your name.
      </p>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Add lodging"}
      </button>
    </form>
  );
}
