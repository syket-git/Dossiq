"use client";

import { useEffect, useState } from "react";
import { api, type CountRow } from "@/lib/api";
import { ErrorNote, Page } from "@/components/ui";

const GUARDRAIL_LABEL: Record<string, string> = {
  guardrail_input_blocked: "Questions blocked",
  guardrail_output_blocked: "Answers hidden",
};

function sum(rows: CountRow[], key: string, value: string | number) {
  return rows.filter((r) => String(r[key]) === String(value)).reduce((n, r) => n + Number(r.total), 0);
}

function Row({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between">
        <span>{label}</span>
        <span className="font-display text-xl font-semibold tabular-nums">{value}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-fog" aria-hidden>
        <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}

export default function Insights() {
  const [data, setData] = useState<{ docs: CountRow[]; feedback: CountRow[]; guard: CountRow[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.metrics(), api.guardrails().catch(() => ({ events: [] as CountRow[] }))])
      .then(([m, g]) => setData({ docs: m.documents, feedback: m.feedback, guard: g.events }))
      .catch((e) => setError(e.message));
  }, []);

  const docTotal = data?.docs.reduce((n, r) => n + Number(r.total), 0) ?? 0;
  const fbTotal = data?.feedback.reduce((n, r) => n + Number(r.total), 0) ?? 0;
  const guardTotal = data?.guard.reduce((n, r) => n + Number(r.total), 0) ?? 0;

  return (
    <Page title="Insights" intro="How the workspace is being used.">
      {error && <ErrorNote message={error} />}
      {!data && !error && <p className="text-slate">Loading insights…</p>}
      {data && (
        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-md border border-line bg-paper p-5">
            <h3 className="font-display font-semibold">Documents ({docTotal})</h3>
            <ul className="divide-y divide-line">
              {["ready", "processing", "pending", "failed"].map((s) => (
                <Row key={s} label={s[0].toUpperCase() + s.slice(1)} value={sum(data.docs, "status", s)} total={docTotal} />
              ))}
            </ul>
          </section>
          <section className="rounded-md border border-line bg-paper p-5">
            <h3 className="font-display font-semibold">Answer feedback ({fbTotal})</h3>
            <ul className="divide-y divide-line">
              <Row label="Helpful" value={sum(data.feedback, "rating", 1)} total={fbTotal} />
              <Row label="Not helpful" value={sum(data.feedback, "rating", -1)} total={fbTotal} />
            </ul>
          </section>
          <section className="rounded-md border border-line bg-paper p-5">
            <h3 className="font-display font-semibold">Guardrails ({guardTotal})</h3>
            <ul className="divide-y divide-line">
              {Object.entries(GUARDRAIL_LABEL).map(([k, label]) => (
                <Row key={k} label={label} value={sum(data.guard, "action", k)} total={guardTotal} />
              ))}
            </ul>
          </section>
        </div>
      )}
    </Page>
  );
}
