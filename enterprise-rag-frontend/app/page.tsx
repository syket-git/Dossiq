"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChartColumn, FileText, MessageCircle, ShieldCheck } from "lucide-react";
import { api, type Info } from "@/lib/api";
import { Orb } from "@/components/ui";
import Chat from "@/components/Chat";
import Documents from "@/components/Documents";
import Approvals from "@/components/Approvals";
import Insights from "@/components/Insights";

const VIEWS = [
  { id: "ask", label: "Ask", icon: MessageCircle },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "approvals", label: "Approvals", icon: ShieldCheck },
  { id: "insights", label: "Insights", icon: ChartColumn },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

const STATE_TEXT = {
  checking: "Connecting",
  ready: "Connected",
  down: "API or database offline",
};
const STATE_COLOR = {
  checking: "var(--amber)",
  ready: "var(--mint)",
  down: "var(--danger)",
};

export default function Home() {
  const [view, setView] = useState<ViewId>("ask");
  const [info, setInfo] = useState<Info | null>(null);
  const [apiState, setApiState] = useState<keyof typeof STATE_TEXT>("checking");

  useEffect(() => {
    api.info().then(setInfo).catch(() => setInfo(null));
    api
      .ready()
      .then(() => setApiState("ready"))
      .catch(() => setApiState("down"));
  }, []);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-line bg-surface/60 px-4 py-4 backdrop-blur-xl md:w-64 md:border-r md:px-5 md:py-7">
        <div className="flex items-center gap-3">
          <Orb size={30} />
          <div>
            <h1 className="font-display text-xl font-medium tracking-tight">Dossiq</h1>
            <p className="hidden text-xs text-muted md:block">Answers from your documents</p>
          </div>
        </div>

        <nav aria-label="Main" className="flex gap-1 overflow-x-auto [scrollbar-width:none] md:flex-col">
          {VIEWS.map(({ id, label, icon: Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] whitespace-nowrap transition-colors ${
                  active ? "text-text" : "text-muted hover:text-text"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl border border-line-strong bg-white/[0.06]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon size={18} strokeWidth={1.75} className={`relative ${active ? "text-violet" : ""}`} />
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto hidden space-y-3 rounded-2xl border border-line bg-white/[0.02] p-4 text-[13px] md:block">
          <p className="flex items-center gap-2 text-text">
            <span className="relative flex h-2 w-2">
              {apiState !== "down" && (
                <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: STATE_COLOR[apiState] }} />
              )}
              <span className="relative h-2 w-2 rounded-full" style={{ background: STATE_COLOR[apiState] }} />
            </span>
            {STATE_TEXT[apiState]}
          </p>
          {info && (
            <dl className="space-y-1 text-muted">
              <div>
                <dt className="sr-only">Signed in as</dt>
                <dd>Signed in as {info.user}</dd>
              </div>
              <div>
                <dt className="sr-only">Workspace</dt>
                <dd>
                  {info.tenant}, {info.region}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </aside>

      <main className="min-h-0 flex-1 overflow-hidden">
        {/* Chat stays mounted so the conversation and its sources survive tab switches. */}
        <div className={view === "ask" ? "h-full" : "hidden"}>
          <Chat onOpenApprovals={() => setView("approvals")} />
        </div>
        {view === "documents" && <Documents />}
        {view === "approvals" && <Approvals isAdmin={info?.admin ?? true} />}
        {view === "insights" && <Insights />}
      </main>
    </div>
  );
}
