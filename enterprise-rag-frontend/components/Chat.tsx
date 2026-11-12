"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, Check, Copy, Layers, ShieldCheck, SquarePen, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { api, type ChatResponse, type Source } from "@/lib/api";
import { Button, ErrorNote, Orb, hueStyle } from "@/components/ui";

type Turn =
  | { role: "user"; text: string }
  // `restored` turns come from history after a reload. They skip the reveal, and feedback is hidden so a vote is not counted twice.
  | { role: "assistant"; res: ChatResponse; rated?: -1 | 1; restored?: boolean };


const SUGGESTIONS = ["What is our remote work policy?", "Summarize the latest security guidelines", "Who approves travel expenses?"];

const THINKING_STEPS = ["Searching your documents", "Reading the best passages", "Writing the answer"];

const NOTICE: Partial<Record<ChatResponse["status"], string>> = {
  no_evidence: "No matching passages were found. Upload a document that covers this topic, or rephrase the question.",
  guardrail_blocked: "The answer was hidden because it contained sensitive data.",
};

type StoredMessage = { role: string; content: string; sources: Source[] | null; status: ChatResponse["status"] | null };

function toTurns(messages: StoredMessage[], restored = true): Turn[] {
  return messages.map((m) =>
    m.role === "user"
      ? { role: "user", text: m.content }
      : { role: "assistant", restored, res: { answer: m.content, sources: m.sources ?? [], status: m.status ?? "answered" } },
  );
}

function latestSources(turns: Turn[]) {
  const last = turns.findLast((t) => t.role === "assistant" && t.res.sources.length > 0);
  return last?.role === "assistant" ? last.res.sources : [];
}

const APPROVAL_POLL_MS = 5000;

const ease = [0.22, 1, 0.36, 1] as const;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Turn "[1]" into a markdown link "#cite-1" so the renderer can swap it for a citation button.
function linkCitations(text: string, sources: Source[]) {
  const known = new Set(sources.map((s) => s.index));
  return text.replace(/\[(\d+)\](?!\()/g, (whole, n) => (known.has(Number(n)) ? `[${n}](#cite-${n})` : whole));
}

// Reveal an answer a few words at a time, so it reads like it is being written.
function useReveal(text: string, animate: boolean) {
  const parts = useMemo(() => text.split(/(\s+)/), [text]);
  const [count, setCount] = useState(() => (animate && !prefersReducedMotion() ? 0 : parts.length));
  useEffect(() => {
    if (count >= parts.length) return;
    const step = Math.max(1, Math.ceil(parts.length / 120));
    const id = setInterval(() => setCount((c) => Math.min(parts.length, c + step)), 16);
    return () => clearInterval(id);
    // Run once per answer; `count` only seeds the start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts.length]);
  return { shown: parts.slice(0, count).join(""), done: count >= parts.length };
}

function Answer({ res, animate, onCite }: { res: ChatResponse; animate: boolean; onCite: (n: number) => void }) {
  const { shown, done } = useReveal(res.answer, animate);

  const components = useMemo<Components>(
    () => ({
      a: ({ href, children }) => {
        const m = href?.match(/^#cite-(\d+)$/);
        if (m) {
          const n = Number(m[1]);
          return (
            <button type="button" className="cite" style={hueStyle(n)} onClick={() => onCite(n)} aria-label={`Show source ${n}`}>
              {n}
            </button>
          );
        }
        return (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      },
    }),
    [onCite],
  );

  return (
    <div className={`answer ${done ? "" : "caret"}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {linkCitations(shown, res.sources)}
      </ReactMarkdown>
    </div>
  );
}

function Thinking() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, THINKING_STEPS.length - 1)), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-4" aria-live="polite">
      <Orb size={26} thinking />
      <AnimatePresence mode="wait">
        <motion.span
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="shimmer font-medium"
        >
          {THINKING_STEPS[step]}
        </motion.span>
      </AnimatePresence>
    </motion.li>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          })
          .catch(() => {});
      }}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition hover:bg-white/[0.06] hover:text-text"
      aria-label="Copy answer"
    >
      {copied ? <Check size={14} className="text-mint" /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function Chat({
  workspaceId,
  onOpenApprovals,
}: {
  workspaceId: string;
  onOpenApprovals?: () => void;
}) {
  const STORAGE_KEY = `dossiq.conversation.${workspaceId}`;
  const [turns, setTurns] = useState<Turn[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeSources, setActiveSources] = useState<Source[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  // Small screens show sources in a bottom sheet, opened on demand.
  const [sheetOpen, setSheetOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
        const restored = toTurns(messages);
        setConversationId(id!);
        setTurns(restored);
        setActiveSources(latestSources(restored));
      })
      .catch(() => {});
  }, [STORAGE_KEY]);

  const lastTurn = turns.at(-1);
  const waiting = !busy && lastTurn?.role === "assistant" && lastTurn.res.status === "pending_approval";
  useEffect(() => {
    if (!waiting || !conversationId) return;
    const known = turns.length;
    const id = setInterval(() => {
      api
        .messages(conversationId)
        .then(({ messages }) => {
          if (messages.length <= known) return;
          const next = [...toTurns(messages.slice(0, known)), ...toTurns(messages.slice(known), false)];
          setTurns(next);
          setActiveSources(latestSources(next));
        })
        .catch(() => {});
    }, APPROVAL_POLL_MS);
    return () => clearInterval(id);
  }, [waiting, conversationId, turns.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  // Grow the input with its content, up to a limit.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [question]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
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
      if (res.sources.length > 0) setActiveSources(res.sources);
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
    inputRef.current?.focus();
  }

  function cite(sources: Source[], n: number) {
    setActiveSources(sources);
    setSheetOpen(true);
    setFlash(n);
    requestAnimationFrame(() => document.getElementById(`source-${n}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }

  function rate(index: number, rating: -1 | 1) {
    setTurns((t) => t.map((turn, i) => (i === index && turn.role === "assistant" ? { ...turn, rated: rating } : turn)));
    api.feedback(rating).catch(() => {});
  }

  const firstQuestion = turns.find((t) => t.role === "user");
  const empty = turns.length === 0 && !busy && !restoring;

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-16 items-center justify-between gap-4 border-b border-line px-4 py-3 md:px-8">
          <h2 className="truncate font-medium text-muted">
            {firstQuestion?.role === "user" ? firstQuestion.text : "New conversation"}
          </h2>
          {turns.length > 0 && (
            <Button variant="quiet" onClick={newConversation} className="shrink-0 !px-4 !py-2">
              <SquarePen size={15} />
              New conversation
            </Button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 md:px-8">
          {restoring && turns.length === 0 && (
            <div className="mx-auto mt-16 flex max-w-2xl items-center gap-3 text-muted" aria-live="polite">
              <Orb size={20} thinking />
              Loading your last conversation
            </div>
          )}

          <AnimatePresence>
            {empty && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="mx-auto mt-6 flex max-w-2xl flex-col items-center text-center md:mt-16"
              >
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9, ease }}>
                  <Orb size={88} />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.6, ease }}
                  className="mt-10 font-display text-3xl leading-tight font-medium tracking-tight text-balance md:text-[2.6rem]"
                >
                  What do you want to know?
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.6 }}
                  className="mt-4 max-w-md leading-relaxed text-muted"
                >
                  Dossiq answers from your uploaded documents only. Every answer shows the passages it used.
                </motion.p>
                <motion.ul
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.6 } } }}
                  className="mt-10 flex flex-wrap justify-center gap-2"
                >
                  {SUGGESTIONS.map((s) => (
                    <motion.li key={s} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                      <button
                        onClick={() => {
                          setQuestion(s);
                          inputRef.current?.focus();
                        }}
                        className="rounded-full border border-line-strong bg-white/[0.03] px-4 py-2 text-sm text-muted transition hover:border-violet/60 hover:bg-violet/10 hover:text-text"
                      >
                        {s}
                      </button>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )}
          </AnimatePresence>

          <ol className="mx-auto max-w-2xl space-y-8">
            {turns.map((turn, i) =>
              turn.role === "user" ? (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease }}
                  className="flex justify-end"
                >
                  <p className="max-w-[85%] rounded-3xl rounded-br-md border border-line-strong bg-raised px-5 py-3 whitespace-pre-wrap">
                    {turn.text}
                  </p>
                </motion.li>
              ) : (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease }}
                  className="flex gap-4"
                >
                  <div className="pt-1">
                    <Orb size={24} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    {turn.res.status === "pending_approval" ? (
                      <div className="rounded-2xl border border-amber/40 bg-amber/10 px-5 py-4">
                        <p>{turn.res.answer}</p>
                        {onOpenApprovals && (
                          <button onClick={onOpenApprovals} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber hover:underline">
                            <ShieldCheck size={15} />
                            Open approvals
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <Answer res={turn.res} animate={!turn.restored} onCite={(n) => cite(turn.res.sources, n)} />
                        {NOTICE[turn.res.status] && (
                          <p className="rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-sm text-muted">{NOTICE[turn.res.status]}</p>
                        )}
                      </>
                    )}
                    {turn.res.status === "answered" && (
                      <div className="-ml-2.5 flex flex-wrap items-center gap-1 text-sm text-muted">
                        {turn.res.sources.length > 0 && (
                          <button
                            onClick={() => {
                              setActiveSources(turn.res.sources);
                              setSheetOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition hover:bg-white/[0.06] hover:text-text"
                          >
                            <Layers size={14} />
                            {turn.res.sources.length} {turn.res.sources.length === 1 ? "source" : "sources"}
                          </button>
                        )}
                        <CopyButton text={turn.res.answer} />
                        {turn.restored ? null : turn.rated ? (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-2.5 py-1 text-mint">
                            Thanks for the feedback
                          </motion.span>
                        ) : (
                          <>
                            <button
                              onClick={() => rate(i, 1)}
                              className="rounded-full p-1.5 transition hover:bg-mint/10 hover:text-mint"
                              aria-label="Helpful answer"
                              title="Helpful"
                            >
                              <ThumbsUp size={15} />
                            </button>
                            <button
                              onClick={() => rate(i, -1)}
                              className="rounded-full p-1.5 transition hover:bg-danger-soft hover:text-danger"
                              aria-label="Not helpful answer"
                              title="Not helpful"
                            >
                              <ThumbsDown size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </motion.li>
              ),
            )}
            <AnimatePresence>{busy && <Thinking key="thinking" />}</AnimatePresence>
          </ol>
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="px-4 pt-2 pb-4 md:px-8 md:pb-6">
          <div className="mx-auto max-w-2xl space-y-3">
            {error && <ErrorNote message={error} />}
            <div className="ring-prism glass flex items-end gap-2 rounded-[28px] p-2 pl-5 shadow-[0_20px_60px_-25px_rgb(124_58_237_/_0.6)]">
              <label htmlFor="question" className="sr-only">
                Your question
              </label>
              <textarea
                id="question"
                ref={inputRef}
                rows={1}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask about your documents"
                maxLength={2000}
                className="max-h-[200px] min-h-10 flex-1 resize-none bg-transparent py-2.5 leading-relaxed placeholder:text-faint focus:outline-none focus-visible:outline-none"
              />
              <button
                type="submit"
                disabled={busy || question.trim().length < 3}
                aria-label="Send question"
                className="btn-prism grid h-10 w-10 shrink-0 place-items-center rounded-full transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            </div>
            <p className="hidden text-center text-xs text-faint md:block">Enter to send. Shift + Enter for a new line.</p>
          </div>
        </form>
      </section>

      <AnimatePresence>
        {sheetOpen && (
          <motion.button
            key="backdrop"
            aria-label="Close sources"
            onClick={() => setSheetOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-night/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>
      <aside
        className={`${
          sheetOpen ? "fixed inset-x-0 bottom-0 z-40 max-h-[72vh] rounded-t-3xl border-t border-line-strong bg-surface shadow-2xl" : "hidden"
        } shrink-0 overflow-y-auto px-5 py-6 lg:static lg:block lg:max-h-none lg:w-[340px] lg:rounded-none lg:border-t-0 lg:border-l lg:border-line lg:bg-surface/50 lg:shadow-none lg:backdrop-blur-xl`}
      >
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-sm font-medium tracking-tight">
            Sources
            {activeSources.length > 0 && <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-sans text-xs text-muted">{activeSources.length}</span>}
          </h3>
          <button onClick={() => setSheetOpen(false)} className="rounded-full p-1.5 text-muted hover:bg-white/[0.06] hover:text-text lg:hidden" aria-label="Close sources">
            <X size={18} />
          </button>
        </div>
        {activeSources.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">The passages behind each answer show up here. Click a colored number in an answer to jump to its source.</p>
        ) : (
          <ol className="mt-5 space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
              {activeSources.map((s, i) => (
                <motion.li
                  key={`${s.document_id}-${s.index}-${s.excerpt.slice(0, 20)}`}
                  layout
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, delay: i * 0.05, ease }}
                  id={`source-${s.index}`}
                  onAnimationEnd={() => setFlash(null)}
                  style={hueStyle(s.index)}
                  className={`source-card rounded-2xl border border-line bg-white/[0.025] p-4 ${flash === s.index ? "source-flash" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="cite !m-0 !cursor-default !align-baseline">{s.index}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" title={s.title}>
                        {s.title || "Untitled document"}
                      </p>
                      <p className="text-xs text-muted">Page {s.page}</p>
                    </div>
                  </div>
                  <p className="mt-3 border-l-2 pl-3 text-[13px] leading-relaxed text-muted" style={{ borderColor: "color-mix(in oklab, var(--hue) 50%, transparent)" }}>
                    {s.excerpt}
                  </p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        )}
      </aside>
    </div>
  );
}

