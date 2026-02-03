import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ADMIN_CODE_KEY = "adminCode";

type DraftQuestion = {
  id: string;
  question: string;
  answer: string;
  subsectionId: string;
  createdAt: string;
};

function getStoredCode(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_CODE_KEY);
  } catch {
    return null;
  }
}

function setStoredCode(code: string): void {
  try {
    sessionStorage.setItem(ADMIN_CODE_KEY, code);
  } catch {
    // ignore
  }
}

export default function AdminGeneratedQuestions() {
  const [codeInput, setCodeInput] = useState("");
  const [unlocked, setUnlocked] = useState(() => !!getStoredCode());
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  // When unlocked (stored code), start loading so we never flash "No draft questions" then "Loading..."
  const [loading, setLoading] = useState(() => !!getStoredCode());
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);

  const adminCode = getStoredCode();

  const fetchDrafts = useCallback(async () => {
    if (!adminCode) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/generated-questions", {
        headers: { "X-Admin-Code": adminCode },
        credentials: "include",
      });
      if (res.status === 403) {
        setError("Invalid admin code");
        setDrafts([]);
        return;
      }
      if (!res.ok) {
        setError("Failed to load draft questions");
        return;
      }
      const data = await res.json();
      setDrafts(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load draft questions");
    } finally {
      setLoading(false);
    }
  }, [adminCode]);

  useEffect(() => {
    if (unlocked && adminCode) fetchDrafts();
  }, [unlocked, adminCode, fetchDrafts]);

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);
    const code = codeInput.trim();
    if (code !== "1127") {
      setCodeError("Invalid code");
      return;
    }
    setStoredCode(code);
    setUnlocked(true);
    setCodeInput("");
  };

  const handleApprove = async (id: string) => {
    if (!adminCode) return;
    setActingId(id);
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Code": adminCode,
        },
        credentials: "include",
        body: JSON.stringify({ visible: true }),
      });
      if (res.ok) {
        setDrafts((prev) => prev.filter((q) => q.id !== id));
      }
    } finally {
      setActingId(null);
    }
  };

  const handleReject = (id: string) => {
    setRejectedIds((prev) => new Set(prev).add(id));
  };

  const handleGenerateMore = async () => {
    if (!adminCode) return;
    setGenerating(true);
    setGenerateMessage(null);
    try {
      const res = await fetch("/api/admin/generate-questions", {
        method: "POST",
        headers: { "X-Admin-Code": adminCode },
        credentials: "include",
      });
      if (res.status === 403) {
        setError("Invalid admin code");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setGenerateMessage(data?.message ?? data?.error ?? "Generation failed");
        return;
      }
      const data = await res.json();
      const { created = 0, total = 0, skipped = 0 } = data;
      setGenerateMessage(
        `Created ${created} new draft${created !== 1 ? "s" : ""}${total > 0 ? ` (${skipped} skipped)` : ""}.`
      );
      await fetchDrafts();
    } catch {
      setGenerateMessage("Request failed (check server logs if it timed out).");
    } finally {
      setGenerating(false);
    }
  };

  const visibleDrafts = Array.isArray(drafts) ? drafts.filter((q) => !rejectedIds.has(q.id)) : [];

  if (!unlocked) {
    return (
      <div
        className="w-full flex items-center justify-center p-4 overflow-auto"
        style={{
          background: "var(--background, #fff)",
          color: "var(--foreground, #111)",
          minHeight: "100vh",
          height: "100vh",
        }}
      >
        <Card
          className="w-full max-w-sm p-6 border border-border shadow-md"
          style={{ background: "var(--card, #fff)", color: "var(--card-foreground, #111)" }}
        >
          <h1 className="text-lg font-semibold mb-2" style={{ color: "inherit" }}>
            Admin Access Only
          </h1>
          <p className="text-sm opacity-80 mb-4">Enter the admin code to continue.</p>
          <form onSubmit={handleCodeSubmit}>
            <Label htmlFor="admin-code" className="sr-only">
              Admin Code
            </Label>
            <Input
              id="admin-code"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="mb-3"
            />
            {codeError && <p className="text-sm text-destructive mb-2">{codeError}</p>}
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const handleReenterCode = () => {
    setStoredCode("");
    setUnlocked(false);
    setError(null);
    setDrafts([]);
  };

  return (
    <div
      className="w-full p-4 md:p-6 flex flex-col overflow-auto"
      style={{
        background: "var(--background, #fff)",
        color: "var(--foreground, #111)",
        minHeight: "100vh",
        height: "100vh",
      }}
    >
      <div className="max-w-3xl mx-auto flex-1 w-full min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-semibold mb-1">Generated Questions (Drafts)</h1>
            <p className="text-sm text-muted-foreground">
              Approve to make visible to users, or reject to leave hidden.
            </p>
          </div>
          <Button
            onClick={handleGenerateMore}
            disabled={generating}
            variant="outline"
            className="shrink-0"
          >
            {generating ? (
              <span className="animate-pulse">Generating…</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate More Questions
              </>
            )}
          </Button>
        </div>
        {generateMessage && (
          <p className="text-sm text-muted-foreground mb-4">{generateMessage}</p>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center justify-between gap-2">
            <span>{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={handleReenterCode}>
              Please Re-Enter Code
            </Button>
          </div>
        )}
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : visibleDrafts.length === 0 && !error ? (
          <p className="text-muted-foreground">No draft questions to review.</p>
        ) : visibleDrafts.length === 0 ? (
          <p className="text-muted-foreground">No draft questions to review.</p>
        ) : (
          <ul className="space-y-6">
            {visibleDrafts.map((q, index) => (
              <li key={q?.id ?? `draft-${index}`}>
                <Card className="p-4 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {q?.subsectionId ?? ""} · {q?.createdAt ? new Date(q.createdAt).toLocaleString() : ""}
                    </p>
                    <div className="prose prose-sm dark:prose-invert max-w-none mb-3">
                      <p className="whitespace-pre-wrap">{q?.question ?? ""}</p>
                    </div>
                    <details className="mt-2">
                      <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                        Answer & Explanation
                      </summary>
                      <div className="mt-2 pl-2 border-l-2 border-muted">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children, ...props }) => (
                                <p className="whitespace-pre-wrap my-1" {...props}>
                                  {children}
                                </p>
                              ),
                            }}
                          >
                            {q?.answer ?? ""}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </details>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(q?.id ?? "")}
                      disabled={actingId !== null}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(q?.id ?? "")}
                      disabled={actingId !== null}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
