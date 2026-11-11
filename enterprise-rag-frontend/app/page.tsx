"use client";

import { useEffect, useState } from "react";
import { api, type Info } from "@/lib/api";
import Chat from "@/components/Chat";
import Documents from "@/components/Documents";
import Approvals from "@/components/Approvals";
import Insights from "@/components/Insights";

const VIEWS = [
  { id: "ask", label: "Ask" },
  { id: "documents", label: "Documents" },
  { id: "approvals", label: "Approvals" },
  { id: "insights", label: "Insights" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

export default function Home() {
  const [view, setView] = useState<ViewId>("ask");
  const [info, setInfo] = useState<Info | null>(null);
  const [apiState, setApiState] = useState<"checking" | "ready" | "down">("checking");

  useEffect(() => {
    api.info().then(setInfo).catch(() => setInfo(null));
    api
      .ready()
      .then(() => setApiState("ready"))
      .catch(() => setApiState("down"));
  }, []);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-line bg-paper px-4 py-4 md:w-60 md:border-r md:px-5 md:py-7">
        <div className="flex items-center justify-between md:block">
          <h1 className="font-display text-2xl font-bold tracking-tight">Dossiq</h1>
          <p className="text-sm text-slate md:mt-1">Answers from your documents</p>
        </div>

        <nav aria-label="Main" className="flex gap-1 overflow-x-auto md:flex-col">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              aria-current={view === v.id ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-left text-[15px] whitespace-nowrap transition-colors ${
                view === v.id ? "bg-teal-soft font-semibold text-teal" : "text-slate hover:bg-fog hover:text-ink"
              }`}
            >
              {v.label}
            </button>
          ))}
        </nav>

        <dl className="mt-auto hidden space-y-2 border-t border-line pt-4 text-[13px] text-slate md:block">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                apiState === "ready" ? "bg-teal" : apiState === "down" ? "bg-alert" : "bg-line"
              }`}
            />
            <dd>
              {apiState === "ready" ? "API and database ready" : apiState === "down" ? "API or database offline" : "Checking API"}
            </dd>
          </div>
          {info && (
            <>
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
            </>
          )}
        </dl>
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
