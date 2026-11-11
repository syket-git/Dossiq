// Typed client for the FastAPI backend. All paths go through the Next.js proxy.

export type Source = {
  index: number;
  document_id: string;
  title: string;
  page: number;
  excerpt: string;
};

export type ChatStatus =
  | "answered"
  | "no_evidence"
  | "pending_approval"
  | "guardrail_blocked";

export type ChatResponse = {
  answer: string;
  sources: Source[];
  status: ChatStatus;
  conversation_id?: string;
  approval_id?: string;
};

export type DocumentRow = {
  id: string;
  title: string;
  status: string;
  current_version: number;
  created_at: string;
  allowed_groups: string[];
};

export type Approval = {
  id: string;
  requester: string;
  question: string;
  status: "pending" | "approved" | "rejected";
  reviewer: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type Info = {
  region: string;
  mode: string;
  user: string;
  tenant: string;
  admin: boolean;
  hitl_enabled: boolean;
};

export type CountRow = { total: number } & Record<string, string | number>;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(0, "Cannot reach the API. Check that FastAPI is running on port 8000.");
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") message = body.detail;
      else if (Array.isArray(body.detail)) message = body.detail.map((d: { msg: string }) => d.msg).join("; ");
    } catch {
      if (res.status >= 500) message = "The API returned a server error. Check the FastAPI logs.";
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });

export const api = {
  info: () => request<Info>("/api/info"),
  ready: () => request<{ status: string }>("/health/ready"),

  chat: (question: string, conversation_id?: string) =>
    post<ChatResponse>("/api/chat", { question, conversation_id }),
  messages: (conversation_id: string) =>
    request<{
      messages: { role: string; content: string; sources: Source[] | null; status: ChatStatus | null; created_at: string }[];
    }>(
      `/api/conversations/${conversation_id}/messages`,
    ),
  feedback: (rating: -1 | 0 | 1, note = "") => post<{ saved: boolean }>("/api/feedback", { rating, note }),

  documents: () => request<{ documents: DocumentRow[] }>("/api/documents"),

  // Three steps: get a presigned S3 URL, PUT the file to S3, then ask the API to ingest it.
  async upload(file: File, onStep?: (step: "requesting" | "uploading" | "indexing") => void) {
    onStep?.("requesting");
    const slot = await post<{ document_id: string; upload_url: string; headers: Record<string, string> }>(
      "/api/documents/uploads",
      { filename: file.name },
    );
    onStep?.("uploading");
    // If the file never reaches S3, remove the pending row so it is not stuck.
    const abort = (reason: string) =>
      post(`/api/documents/${slot.document_id}/abort`, { reason }).catch(() => {});
    let put: Response;
    try {
      put = await fetch(slot.upload_url, { method: "PUT", headers: slot.headers, body: file });
    } catch {
      await abort("s3_put_blocked");
      throw new ApiError(0, "Upload to S3 was blocked. Add a CORS rule to the S3 bucket that allows PUT from this site.");
    }
    if (!put.ok) {
      await abort(`s3_put_${put.status}`);
      throw new ApiError(put.status, `S3 rejected the upload (${put.status}).`);
    }
    onStep?.("indexing");
    return post<{ status: string }>("/api/documents/complete", { document_id: slot.document_id });
  },

  metrics: () => request<{ documents: CountRow[]; feedback: CountRow[] }>("/api/admin/metrics"),
  guardrails: () =>
    request<{ events: CountRow[]; mode: string; managed_bedrock_guardrails: boolean }>("/api/admin/guardrails"),

  approvals: () => request<{ approvals: Approval[] }>("/api/approvals"),
  decide: (id: string, approve: boolean) =>
    post<{ status: string; executed: boolean }>(`/api/approvals/${id}/decision`, { approve }),
};
