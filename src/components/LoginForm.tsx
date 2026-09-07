"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HOUSEHOLDS } from "@/lib/households";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [household, setHousehold] = useState("florida");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, household }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
      <h2 className="font-serif text-xl text-amber-950">Sign in (passwordless)</h2>
      <p className="text-sm text-amber-900/70">
        Demo mode: enter any email + household. No Supabase required. Use{" "}
        <code className="rounded bg-amber-50 px-1">joe@example.com</code> for admin.
      </p>
      <label className="block text-sm">
        Email
        <input
          className="mt-1 w-full rounded-lg border border-amber-200 px-3 py-2"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Display name
        <input
          className="mt-1 w-full rounded-lg border border-amber-200 px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Household
        <select
          className="mt-1 w-full rounded-lg border border-amber-200 px-3 py-2"
          value={household}
          onChange={(e) => setHousehold(e.target.value)}
        >
          {HOUSEHOLDS.map((h) => (
            <option key={h.id} value={h.id}>
              {h.label}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Continue"}
      </button>
    </form>
  );
}
