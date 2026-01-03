"use client";

import { useState } from "react";

export default function BellatronPage() {
  const [log, setLog] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setResult(null);

    const r = await fetch("/api/bellatron/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ log_text: log }),
    });

    const data = await r.json().catch(() => ({}));
    setResult({ status: r.status, data });
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-semibold">WillexOS · Bellatron</h1>

      <textarea
        className="mt-4 w-full h-64 bg-neutral-900 border border-neutral-700 rounded p-3 font-mono text-sm"
        placeholder="Paste PositionSense log here…"
        value={log}
        onChange={(e) => setLog(e.target.value)}
      />

      <button
        className="mt-4 bg-lime-400 text-black px-4 py-2 rounded font-semibold disabled:opacity-50"
        disabled={!log.trim() || loading}
        onClick={analyze}
      >
        {loading ? "Analyzing…" : "Analyze"}
      </button>

      {result && (
        <pre className="mt-4 bg-neutral-900 border border-neutral-700 rounded p-3 text-xs overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
