"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, CloudUpload, FileText, LoaderCircle } from "lucide-react";
import { api, type DocumentRow } from "@/lib/api";
import { ErrorNote, Page, StatusPill, formatDate } from "@/components/ui";

const STEPS = [
  { id: "requesting", label: "Preparing upload" },
  { id: "uploading", label: "Uploading file" },
  { id: "indexing", label: "Indexing. This can take a minute." },
] as const;

type Step = (typeof STEPS)[number]["id"];

const ACCEPT = [".pdf", ".docx", ".txt", ".md"];

function extension(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toUpperCase() : "FILE";
}

export default function Documents() {
  const [docs, setDocs] = useState<DocumentRow[] | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step | null>(null);
  const [fileName, setFileName] = useState("");
  const [done, setDone] = useState("");
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    api
      .documents()
      .then((r) => setDocs(r.documents))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function onFile(file: File | undefined) {
    if (!file || step) return;
    if (!ACCEPT.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setError("Dossiq can read PDF, DOCX, TXT, and Markdown files. Choose one of those.");
      return;
    }
    setError("");
    setDone("");
    setFileName(file.name);
    try {
      await api.upload(file, setStep);
      setDone(`${file.name} is ready. You can ask questions about it now.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStep(null);
      if (input.current) input.current.value = "";
      load();
    }
  }

  const stepIndex = step ? STEPS.findIndex((s) => s.id === step) : -1;

  return (
    <Page title="Documents" intro="Add the files Dossiq should answer from. PDF, DOCX, TXT, and Markdown work, up to 10 MB each.">
      <div className="space-y-6">
        <input
          ref={input}
          type="file"
          accept={ACCEPT.join(",")}
          className="sr-only"
          id="file"
          onChange={(e) => onFile(e.target.files?.[0])}
        />

        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onFile(e.dataTransfer.files?.[0]);
          }}
          disabled={step !== null}
          data-active={dragging}
          className="dropzone group relative w-full overflow-hidden rounded-3xl bg-white/[0.02] px-6 py-12 text-center transition hover:bg-white/[0.04] disabled:cursor-wait"
        >
          <AnimatePresence mode="wait">
            {step ? (
              <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-sm text-left" aria-live="polite">
                <p className="mb-5 truncate text-center font-medium">{fileName}</p>
                <ol className="space-y-3">
                  {STEPS.map((s, i) => {
                    const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "todo";
                    return (
                      <li key={s.id} className={`flex items-center gap-3 text-sm ${state === "todo" ? "text-faint" : "text-text"}`}>
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
                            state === "done" ? "border-mint bg-mint/15 text-mint" : state === "active" ? "border-violet text-violet" : "border-line-strong"
                          }`}
                        >
                          {state === "done" ? <Check size={13} /> : state === "active" ? <LoaderCircle size={13} className="animate-spin" /> : <span className="text-[11px]">{i + 1}</span>}
                        </span>
                        <span className={state === "active" ? "shimmer" : ""}>{s.label}</span>
                      </li>
                    );
                  })}
                </ol>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-line-strong bg-raised text-violet transition group-hover:-translate-y-1 group-hover:text-mint">
                  <CloudUpload size={26} strokeWidth={1.6} />
                </span>
                <p className="mt-5 font-medium">{dragging ? "Drop to upload" : "Drop a file here, or click to choose one"}</p>
                <p className="mt-1 text-sm text-muted">PDF, DOCX, TXT, or MD</p>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {done && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-xl border border-mint/30 bg-mint/10 px-4 py-3 text-sm text-mint"
            >
              <Check size={16} />
              {done}
            </motion.p>
          )}
        </AnimatePresence>
        {error && <ErrorNote message={error} />}

        {docs === null && !error && (
          <ul className="space-y-2" aria-label="Loading documents">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-16 animate-pulse rounded-2xl bg-white/[0.03]" />
            ))}
          </ul>
        )}
        {docs?.length === 0 && <p className="py-6 text-center text-muted">No documents yet. Upload one above to start asking questions.</p>}
        {docs && docs.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm text-muted">
              {docs.length} {docs.length === 1 ? "document" : "documents"}
            </h3>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white/[0.02]">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-white/[0.03]">
                  <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-raised text-muted">
                    <FileText size={18} strokeWidth={1.6} />
                    <span className="absolute -right-1 -bottom-1 rounded-md bg-violet/20 px-1 text-[9px] font-semibold text-violet">{extension(d.title)}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium" title={d.title}>
                      {d.title}
                    </p>
                    <p className="text-xs text-muted">
                      Version {d.current_version}, added {formatDate(d.created_at)}
                    </p>
                  </div>
                  <StatusPill status={d.status} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Page>
  );
}
