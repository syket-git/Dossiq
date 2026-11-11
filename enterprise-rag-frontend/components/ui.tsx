import type { ReactNode } from "react";

export function Page({ title, intro, actions, children }: { title: string; intro?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-10 md:py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">{title}</h2>
            {intro && <p className="mt-2 max-w-prose text-slate">{intro}</p>}
          </div>
          {actions}
        </header>
        {children}
      </div>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-md border border-alert/30 bg-alert-soft px-4 py-3 text-sm text-alert">
      {message}
    </p>
  );
}

const STATUS_STYLE: Record<string, string> = {
  ready: "bg-teal-soft text-teal",
  approved: "bg-teal-soft text-teal",
  pending: "bg-marker/25 text-ink",
  processing: "bg-marker/25 text-ink",
  failed: "bg-alert-soft text-alert",
  rejected: "bg-alert-soft text-alert",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[status] ?? "bg-fog text-slate"}`}>
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
    primary: "bg-teal text-paper hover:opacity-90",
    quiet: "border border-line bg-paper text-ink hover:bg-fog",
    danger: "border border-alert/40 bg-paper text-alert hover:bg-alert-soft",
  }[variant];
  return (
    <button
      {...props}
      className={`rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    />
  );
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
