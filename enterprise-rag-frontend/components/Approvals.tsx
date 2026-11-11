"use client";

import { useCallback, useEffect, useState } from "react";
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
        <div className="space-y-8">
          {error && <ErrorNote message={error} />}
          {items === null && !error && <p className="text-slate">Loading approvals…</p>}

          {items && (
            <section>
              <h3 className="mb-3 font-display text-lg font-semibold">Waiting for review ({pending.length})</h3>
              {pending.length === 0 ? (
                <p className="text-slate">Nothing to review.</p>
              ) : (
                <ul className="space-y-3">
                  {pending.map((a) => (
                    <li key={a.id} className="rounded-md border border-line bg-paper p-4">
                      <p className="font-medium">{a.question}</p>
                      <p className="mt-1 text-sm text-slate">
                        Asked by {a.requester}, {formatDate(a.created_at)}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button onClick={() => decide(a.id, true)} disabled={deciding === a.id}>
                          Approve
                        </Button>
                        <Button variant="danger" onClick={() => decide(a.id, false)} disabled={deciding === a.id}>
                          Reject
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {reviewed.length > 0 && (
            <section>
              <h3 className="mb-3 font-display text-lg font-semibold">Reviewed</h3>
              <ul className="divide-y divide-line rounded-md border border-line bg-paper">
                {reviewed.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p>{a.question}</p>
                      <p className="mt-1 text-sm text-slate">
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
