"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, type DocumentRow } from "@/lib/api";
import { Button, ErrorNote, Page, StatusPill, formatDate } from "@/components/ui";

const STEP_LABEL = {
  requesting: "Preparing upload",
  uploading: "Uploading to S3",
  indexing: "Indexing document. This can take a minute.",
};

export default function Documents() {
  const [docs, setDocs] = useState<DocumentRow[] | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<keyof typeof STEP_LABEL | null>(null);
  const [done, setDone] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    api
      .documents()
      .then((r) => setDocs(r.documents))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setDone("");
    try {
      await api.upload(file, setStep);
      setDone(`Uploaded and indexed ${file.name}.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStep(null);
      if (input.current) input.current.value = "";
      load();
    }
  }

  return (
    <Page
      title="Documents"
      intro="Upload PDF, DOCX, TXT, or Markdown files. Dossiq indexes them so you can ask questions about them."
      actions={
        <>
          <input
            ref={input}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="sr-only"
            id="file"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <Button onClick={() => input.current?.click()} disabled={step !== null}>
            Upload document
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {step && (
          <p aria-live="polite" className="rounded-md bg-teal-soft px-4 py-3 text-sm text-teal">
            {STEP_LABEL[step]}
          </p>
        )}
        {done && <p className="rounded-md bg-teal-soft px-4 py-3 text-sm text-teal">{done}</p>}
        {error && <ErrorNote message={error} />}

        {docs === null && !error && <p className="text-slate">Loading documents…</p>}
        {docs?.length === 0 && (
          <p className="rounded-md border border-dashed border-line px-6 py-10 text-center text-slate">
            No documents yet. Upload one to start asking questions.
          </p>
        )}
        {docs && docs.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-line bg-paper">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-slate">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Version</th>
                  <th className="px-4 py-3 font-semibold">Added</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium">{d.title}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-slate">v{d.current_version}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate">{formatDate(d.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Page>
  );
}
