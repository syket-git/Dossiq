"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ShieldCheck, X } from "lucide-react";
import { api, type Approval } from "@/lib/api";
import { Button, ErrorNote, Page, StatusPill, formatDate } from "@/components/ui";

export default function Approvals({ isAdmin }: { isAdmin: boolean }) {
  const [items, setItems] = useState<Approval[] | null>(null);
  const [error, setError] = useState("");
  const [deciding, setDeciding] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!isAdmin) return;
    api
      .approvals()
      .then((r) => setItems(r.approvals))
      .catch((e) => setError(e.message));
  }, [isAdmin]);

  useEffect(load, [load]);

  async function decide(id: string, approve: boolean) {
    setDeciding(id);
    setError("");
    try {
      await api.decide(id, approve);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeciding(null);
    }
  }

  const pending = items?.filter((a) => a.status === "pending") ?? [];
  const reviewed = items?.filter((a) => a.status !== "pending") ?? [];

  return (
    <Page
      title="Approvals"
      intro="Questions that ask to delete, export, send, or change policy wait here for an admin. Approving records the decision. It does not run any action."
    >
      {!isAdmin ? (
        <ErrorNote message="Only admins can review approvals." />
      ) : (
        <div className="space-y-10">
          {error && <ErrorNote message={error} />}
          {items === null && !error && <div className="h-28 animate-pulse rounded-2xl bg-white/[0.03]" aria-label="Loading approvals" />}

          {items && (
            <section>
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-medium">
                Waiting for review
                <span className="rounded-full bg-amber/15 px-2 py-0.5 font-sans text-xs text-amber">{pending.length}</span>
              </h3>
              {pending.length === 0 ? (
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.02] px-5 py-6 text-muted">
                  <ShieldCheck size={20} className="text-mint" />
                  Nothing to review.
                </div>
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {pending.map((a) => (
                      <motion.li
                        key={a.id}
                        layout
                        exit={{ opacity: 0, x: 40 }}
                        className="relative overflow-hidden rounded-2xl border border-amber/25 bg-gradient-to-br from-amber/[0.07] to-transparent p-5"
                      >
                        <p className="font-medium leading-relaxed">{a.question}</p>
                        <p className="mt-1.5 text-sm text-muted">
                          Asked by {a.requester}, {formatDate(a.created_at)}
                        </p>
                        <div className="mt-4 flex gap-2">
                          <Button onClick={() => decide(a.id, true)} disabled={deciding === a.id}>
                            <Check size={15} />
                            Approve
                          </Button>
                          <Button variant="danger" onClick={() => decide(a.id, false)} disabled={deciding === a.id}>
                            <X size={15} />
                            Reject
                          </Button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </section>
          )}

          {reviewed.length > 0 && (
            <section>
              <h3 className="mb-4 font-display text-base font-medium">Reviewed</h3>
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white/[0.02]">
                {reviewed.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p>{a.question}</p>
                      <p className="mt-1 text-sm text-muted">
                        {a.reviewer ? `Reviewed by ${a.reviewer}` : "Reviewed"}
                        {a.reviewed_at ? `, ${formatDate(a.reviewed_at)}` : ""}
                      </p>
                    </div>
                    <StatusPill status={a.status} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Page>
  );
}
