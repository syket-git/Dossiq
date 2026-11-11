"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { api, type ChatResponse, type Source } from "@/lib/api";
import { Button, ErrorNote } from "@/components/ui";

type Turn =
  | { role: "user"; text: string }
  // `restored` turns come from history after a reload. Feedback is hidden so a vote is not counted twice.
  | { role: "assistant"; res: ChatResponse; rated?: -1 | 1; restored?: boolean };

const STORAGE_KEY = "dossiq.conversation";

// Turn "text [1] more [2]" into text with clickable citation markers.
function withCitations(text: string, sources: Source[], onCite: (n: number) => void) {
  const known = new Set(sources.map((s) => s.index));
  return text.split(/(\[\d+\])/g).map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    if (m && known.has(Number(m[1]))) {
      const n = Number(m[1]);
      return (
        <button key={i} className="cite" onClick={() => onCite(n)} aria-label={`Show source ${n}`}>
          {n}
        </button>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const NOTICE: Partial<Record<ChatResponse["status"], string>> = {
  no_evidence: "No matching passages were found. Upload a document that covers this topic, or rephrase the question.",
  guardrail_blocked: "The answer was hidden because it contained sensitive data.",
};

export default function Chat({ onOpenApprovals }: { onOpenApprovals: () => void }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeSources, setActiveSources] = useState<Source[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  // Set once the user acts, so a slow history restore cannot overwrite newer state.
  const userActed = useRef(false);
  // True until we know whether there is a saved conversation to restore.
  const [restoring, setRestoring] = useState(true);

  // Restore the last conversation from the API after a page reload.
  useEffect(() => {
    let id: string | null = null;
    try {
      id = localStorage.getItem(STORAGE_KEY);
    } catch {}
    (id ? api.messages(id) : Promise.resolve({ messages: [] }))
      .finally(() => setRestoring(false))
      .then(({ messages }) => {
        if (!id || userActed.current || messages.length === 0) return;
        const restored: Turn[] = messages.map((m) =>
          m.role === "user"
            ? { role: "user", text: m.content }
            : {
                role: "assistant",
                restored: true,
                res: { answer: m.content, sources: m.sources ?? [], status: m.status ?? "answered" },
              },
        );
        setConversationId(id!);
        setTurns(restored);
        const last = restored.findLast((t) => t.role === "assistant");
        if (last?.role === "assistant") setActiveSources(last.res.sources);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 3 || busy) return;
    userActed.current = true;
    setError("");
    setBusy(true);
    setQuestion("");
    setTurns((t) => [...t, { role: "user", text: q }]);
    try {
      const res = await api.chat(q, conversationId);
      if (res.conversation_id) {
        setConversationId(res.conversation_id);
        try {
          localStorage.setItem(STORAGE_KEY, res.conversation_id);
        } catch {}
      }
      setTurns((t) => [...t, { role: "assistant", res }]);
      setActiveSources(res.sources);
    } catch (err) {
      setError((err as Error).message);
      setTurns((t) => t.slice(0, -1));
      setQuestion(q);
    } finally {
      setBusy(false);
    }
  }

  function newConversation() {
    userActed.current = true;
    setTurns([]);
    setConversationId(undefined);
    setActiveSources([]);
    setError("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  function cite(sources: Source[], n: number) {
    setActiveSources(sources);
    setFlash(n);
    requestAnimationFrame(() => document.getElementById(`source-${n}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }

  async function rate(index: number, rating: -1 | 1) {
    setTurns((t) => t.map((turn, i) => (i === index && turn.role === "assistant" ? { ...turn, rated: rating } : turn)));
    api.feedback(rating).catch(() => {});
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 md:px-8">
          <h2 className="font-display text-lg font-semibold">Ask a question</h2>
          {turns.length > 0 && (
            <Button variant="quiet" onClick={newConversation}>
              New conversation
            </Button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {restoring && turns.length === 0 && (
            <p className="mx-auto mt-10 max-w-lg text-slate" aria-live="polite">
              Loading your last conversation…
            </p>
          )}
          {turns.length === 0 && !busy && !restoring && (
            <div className="mx-auto mt-10 max-w-lg">
              <p className="font-display text-3xl leading-tight font-semibold tracking-tight">
                Ask anything your documents can answer.
              </p>
              <p className="mt-3 text-slate">
                Every answer cites the passages it used. Click a yellow marker to read the source.
              </p>
              <ul className="mt-6 space-y-2">
                {["What is our remote work policy?", "Summarize the latest security guidelines", "Who approves travel expenses?"].map((s) => (
                  <li key={s}>
                    <button onClick={() => setQuestion(s)} className="text-left text-teal underline-offset-4 hover:underline">
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ol className="mx-auto max-w-2xl space-y-6">
            {turns.map((turn, i) =>
              turn.role === "user" ? (
                <li key={i} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 whitespace-pre-wrap text-paper">{turn.text}</p>
                </li>
              ) : (
                <li key={i} className="space-y-2">
                  {turn.res.status === "pending_approval" ? (
                    <div className="rounded-lg border border-marker bg-marker/15 px-4 py-3">
                      <p>{turn.res.answer}</p>
                      <button onClick={onOpenApprovals} className="mt-2 text-sm font-semibold text-teal underline underline-offset-4">
                        Open approvals
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {withCitations(turn.res.answer, turn.res.sources, (n) => cite(turn.res.sources, n))}
                      </p>
                      {NOTICE[turn.res.status] && <p className="text-sm text-slate">{NOTICE[turn.res.status]}</p>}
                    </>
                  )}
                  {turn.res.status === "answered" && (
                    <div className="flex items-center gap-3 text-sm text-slate">
                      {turn.res.sources.length > 0 && (
                        <button onClick={() => setActiveSources(turn.res.sources)} className="hover:text-ink">
                          {turn.res.sources.length} {turn.res.sources.length === 1 ? "source" : "sources"}
                        </button>
                      )}
                      {turn.restored ? null : turn.rated ? (
                        <span>Thanks for the feedback</span>
                      ) : (
                        <>
                          <button onClick={() => rate(i, 1)} className="hover:text-teal" aria-label="Helpful answer">
                            Helpful
                          </button>
                          <button onClick={() => rate(i, -1)} className="hover:text-alert" aria-label="Not helpful answer">
                            Not helpful
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </li>
              ),
            )}
            {busy && (
              <li className="text-slate" aria-live="polite">
                Searching your documents…
              </li>
            )}
          </ol>
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="border-t border-line bg-paper px-4 py-4 md:px-8">
          <div className="mx-auto max-w-2xl space-y-3">
            {error && <ErrorNote message={error} />}
            <div className="flex items-end gap-2">
              <label htmlFor="question" className="sr-only">
                Your question
              </label>
              <textarea
                id="question"
                rows={1}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) send(e);
                }}
                placeholder="Ask a question"
                maxLength={2000}
                className="max-h-40 min-h-11 flex-1 resize-y rounded-md border border-line bg-fog px-3 py-2.5 placeholder:text-slate/70 focus:border-teal focus:outline-none"
              />
              <Button type="submit" disabled={busy || question.trim().length < 3} className="h-11">
                Ask
              </Button>
            </div>
          </div>
        </form>
      </section>

      <aside className="max-h-72 shrink-0 overflow-y-auto border-t border-line bg-paper px-5 py-5 lg:max-h-none lg:w-80 lg:border-t-0 lg:border-l">
        <h3 className="font-display font-semibold">Sources</h3>
        {activeSources.length === 0 ? (
          <p className="mt-2 text-sm text-slate">Sources for the latest answer appear here.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {activeSources.map((s) => (
              <li
                key={s.index}
                id={`source-${s.index}`}
                onAnimationEnd={() => setFlash(null)}
                className={`rounded-md border border-line p-3 ${flash === s.index ? "source-flash" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <span className="cite !cursor-default !align-baseline">{s.index}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" title={s.title}>
                      {s.title || "Untitled document"}
                    </p>
                    <p className="text-xs text-slate">Page {s.page}</p>
                  </div>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-slate">{s.excerpt}</p>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}
