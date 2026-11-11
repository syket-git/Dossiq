"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { api, type CountRow } from "@/lib/api";
import { ErrorNote, Page } from "@/components/ui";

const GUARDRAIL_LABEL: Record<string, string> = {
  guardrail_input_blocked: "Questions blocked",
  guardrail_output_blocked: "Answers hidden",
};

function sum(rows: CountRow[], key: string, value: string | number) {
  return rows.filter((r) => String(r[key]) === String(value)).reduce((n, r) => n + Number(r.total), 0);
}

function Row({ label, value, total, color, delay }: { label: string; value: number; total: number; color: string; delay: number }) {
  const pct = total ? (value / total) * 100 : 0;
  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className="font-display text-lg font-medium tabular-nums">{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]" aria-hidden>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </li>
  );
}

function Panel({ title, total, children }: { title: string; total: number; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white/[0.02] p-6">
      <h3 className="text-sm text-muted">{title}</h3>
      <p className="mt-1 mb-3 font-display text-4xl font-medium tabular-nums">{total}</p>
      <ul className="divide-y divide-line">{children}</ul>
    </section>
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

  const total = (rows: CountRow[]) => rows.reduce((n, r) => n + Number(r.total), 0);

  return (
    <Page title="Insights" intro="How the workspace is being used.">
      {error && <ErrorNote message={error} />}
      {!data && !error && (
        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/[0.03]" />
          ))}
        </div>
      )}
      {data && (
        <div className="grid gap-5 md:grid-cols-3">
          <Panel title="Documents" total={total(data.docs)}>
            {[
              ["ready", "var(--mint)"],
              ["processing", "var(--sky)"],
              ["pending", "var(--amber)"],
              ["failed", "var(--danger)"],
            ].map(([s, color], i) => (
              <Row key={s} label={s[0].toUpperCase() + s.slice(1)} value={sum(data.docs, "status", s)} total={total(data.docs)} color={color} delay={i * 0.08} />
            ))}
          </Panel>
          <Panel title="Answer feedback" total={total(data.feedback)}>
            <Row label="Helpful" value={sum(data.feedback, "rating", 1)} total={total(data.feedback)} color="var(--mint)" delay={0.1} />
            <Row label="Not helpful" value={sum(data.feedback, "rating", -1)} total={total(data.feedback)} color="var(--pink)" delay={0.18} />
          </Panel>
          <Panel title="Guardrail events" total={total(data.guard)}>
            {Object.entries(GUARDRAIL_LABEL).map(([k, label], i) => (
              <Row key={k} label={label} value={sum(data.guard, "action", k)} total={total(data.guard)} color="var(--violet)" delay={0.15 + i * 0.08} />
            ))}
          </Panel>
        </div>
      )}
    </Page>
  );
}
