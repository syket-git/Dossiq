"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";

// One spectrum color per citation number. The source card uses the same color.
const HUES = ["var(--violet)", "var(--mint)", "var(--amber)", "var(--pink)", "var(--sky)"];
export function hueStyle(n: number): CSSProperties {
  return { "--hue": HUES[(n - 1) % HUES.length] } as CSSProperties;
}

export function Orb({ size = 28, thinking = false }: { size?: number; thinking?: boolean }) {
  return (
    <span className="orb inline-block shrink-0" data-state={thinking ? "thinking" : "idle"} style={{ width: size, height: size }} aria-hidden>
      <span className="orb-glow" />
    </span>
  );
}

export function Page({ title, intro, actions, children }: { title: string; intro?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <motion.div
      className="h-full overflow-y-auto"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-10 md:py-12">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">{title}</h2>
            {intro && <p className="mt-3 max-w-prose leading-relaxed text-muted">{intro}</p>}
          </div>
          {actions}
        </header>
        {children}
      </div>
    </motion.div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <motion.p
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
    >
      {message}
    </motion.p>
  );
}

const STATUS_STYLE: Record<string, { color: string; pulse?: boolean }> = {
  ready: { color: "var(--mint)" },
  approved: { color: "var(--mint)" },
  pending: { color: "var(--amber)", pulse: true },
  processing: { color: "var(--sky)", pulse: true },
  failed: { color: "var(--danger)" },
  rejected: { color: "var(--danger)" },
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { color: "var(--muted)" };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize"
      style={{ color: s.color, background: `color-mix(in oklab, ${s.color} 14%, transparent)` }}
    >
      <span className="relative flex h-1.5 w-1.5">
        {s.pulse && <span className="absolute inset-0 animate-ping rounded-full" style={{ background: s.color }} />}
        <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      </span>
      {status}
    </span>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "quiet" | "danger" }) {
  const styles = {
    primary: "btn-prism",
    quiet: "border border-line-strong bg-white/[0.03] text-text hover:bg-white/[0.07] hover:border-violet/50",
    danger: "border border-danger/40 text-danger hover:bg-danger-soft",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    />
  );
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
