"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChartColumn, FileText, MessageCircle, ShieldCheck } from "lucide-react";
import { OrganizationList, OrganizationSwitcher, Show, SignIn, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { api, setTokenGetter, type Info } from "@/lib/api";
import { Orb } from "@/components/ui";
import Chat from "@/components/Chat";
import Documents from "@/components/Documents";
import Approvals from "@/components/Approvals";
import Insights from "@/components/Insights";

const VIEWS = [
  { id: "ask", label: "Ask", icon: MessageCircle, adminOnly: false },
  { id: "documents", label: "Documents", icon: FileText, adminOnly: false },
  { id: "approvals", label: "Approvals", icon: ShieldCheck, adminOnly: true },
  { id: "insights", label: "Insights", icon: ChartColumn, adminOnly: true },
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
  return (
    <>
      <Show when="signed-out">
        <Centered title="Dossiq" subtitle="Answers from your team's documents.">
          <SignIn routing="hash" />
        </Centered>
      </Show>
      <Show when="signed-in">
        <SignedInApp />
      </Show>
    </>
  );
}

function Centered({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Orb size={40} />
        <h1 className="font-display text-2xl font-medium tracking-tight">{title}</h1>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function SignedInApp() {
  const { orgId, orgRole, getToken } = useAuth();
  // Set during render: child effects run before parent effects.
  setTokenGetter(() => getToken());

  if (!orgId) {
    return (
      <Centered title="Choose a workspace" subtitle="Create a workspace for your team, or open one you were invited to.">
        <OrganizationList hidePersonal afterSelectOrganizationUrl="/" afterCreateOrganizationUrl="/" />
      </Centered>
    );
  }
  return <Workspace key={orgId} workspaceId={orgId} isAdmin={orgRole === "org:admin"} />;
}

function Workspace({ workspaceId, isAdmin }: { workspaceId: string; isAdmin: boolean }) {
  const [view, setView] = useState<ViewId>("ask");
  const [info, setInfo] = useState<Info | null>(null);
  const [apiState, setApiState] = useState<keyof typeof STATE_TEXT>("checking");
  const { user } = useUser();
  const userName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "";
  const views = VIEWS.filter((v) => isAdmin || !v.adminOnly);
  const current = views.some((v) => v.id === view) ? view : "ask";

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
          <div className="ml-auto md:hidden">
            <UserButton />
          </div>
        </div>

        <OrganizationSwitcher hidePersonal afterSelectOrganizationUrl="/" afterCreateOrganizationUrl="/" />

        <nav aria-label="Main" className="flex gap-1 overflow-x-auto [scrollbar-width:none] md:flex-col">
          {views.map(({ id, label, icon: Icon }) => {
            const active = current === id;
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
          <div className="flex items-center gap-3 text-muted">
            <UserButton />
            <div className="min-w-0">
              <p className="truncate text-text" title={userName}>{userName}</p>
              <p>{isAdmin ? "Admin" : "Member"}{info ? `, ${info.region}` : ""}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-0 flex-1 overflow-hidden">
        {/* Chat stays mounted so the conversation and its sources survive tab switches. */}
        <div className={current === "ask" ? "h-full" : "hidden"}>
          <Chat workspaceId={workspaceId} onOpenApprovals={isAdmin ? () => setView("approvals") : undefined} />
        </div>
        {current === "documents" && <Documents />}
        {current === "approvals" && <Approvals isAdmin={isAdmin} />}
        {current === "insights" && <Insights />}
      </main>
    </div>
  );
}
