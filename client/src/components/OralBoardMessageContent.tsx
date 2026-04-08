import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * After normalization, case blocks always start with "Case N Begins" (optional leading whitespace).
 * Used to split panels and detect case chunks.
 */
const CASE_HEADER_LINE = /^\s*case\s+(?:\d+|[IVXLCDM]+)\s+begins\b/i;

const ROMAN = '\\d+|[IVXLCDM]+';

/** Canonical title for the slash-command help block (model output varies). */
export const COMMANDS_HELP_SECTION_TITLE = 'Commands Available During Case';

function stripLeadingTrailingAsterisks(s: string): string {
  let t = s.trim();
  for (let i = 0; i < 20; i++) {
    const u = t.replace(/^\*+\s*/, '').replace(/\s*\*+$/, '').trim();
    if (u === t) break;
    t = u;
  }
  return t;
}

/**
 * Strips common markdown markers from streamed assistant text so users do not see raw ** / ***
 * while tokens arrive. Final message still renders through ReactMarkdown when streaming ends.
 */
export function stripStreamingMarkdownDecorators(text: string): string {
  let s = text;
  for (let pass = 0; pass < 16; pass++) {
    const before = s;
    s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
    s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
    s = s.replace(/___([^_]+)___/g, '$1');
    s = s.replace(/__([^_]+)__/g, '$1');
    if (s === before) break;
  }
  s = s.replace(/\*{2,}/g, '');
  return s;
}

/**
 * If a line is a "commands during case / session" heading, rewrite to a single canonical title.
 */
export function normalizeCommandHelpHeaders(text: string): string {
  return text
    .split('\n')
    .map((line) => normalizeCommandHelpHeadersLine(line))
    .join('\n');
}

function normalizeCommandHelpHeadersLine(line: string): string {
  const indentMatch = line.match(/^(\s*)/);
  const indent = indentMatch?.[1] ?? '';
  const trimmed = line.trim();
  if (!trimmed) return line;

  let s = trimmed.replace(/^#{1,6}\s+/, '');
  s = stripLeadingTrailingAsterisks(s);
  s = s.replace(/[.:;\uFF1A]\s*$/, '').trim();
  if (!s) return line;

  const c = s.toLowerCase();
  const isCommandsHeading =
    /^commands?\s+available\s+during\s+cases?$/.test(c) ||
    /^commands?\s+available\s+during\s+case$/.test(c) ||
    /^commands?\s+for\s+your\s+session$/.test(c);

  if (!isCommandsHeading) return line;

  return `${indent}**${COMMANDS_HELP_SECTION_TITLE}**`;
}

/**
 * Rewrite any case-style line to "Case N Begins" (+ optional remainder on the next line).
 * Handles ## Case 1, **Case 2**, "Case 3:", "Beginning Case 1.", "Let's begin. Case 1:", etc.
 */
function normalizeOralBoardCaseHeaders(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];

  for (const line of lines) {
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch?.[1] ?? '';
    let s = line.trim();
    if (!s) {
      out.push(line);
      continue;
    }
    s = s.replace(/^#{1,6}\s+/, '');
    s = stripLeadingTrailingAsterisks(s);
    if (!s) {
      out.push(line);
      continue;
    }

    // "Beginning Case 1. A 45-year-old..." (stem on same line)
    let m = s.match(
      new RegExp(`^beginning\\s+case\\s+(${ROMAN})\\s*\\.\\s+(.+)$`, 'i')
    );
    if (m) {
      out.push(`${indent}Case ${m[1]} Begins`);
      out.push(`${indent}${m[2].trim()}`);
      continue;
    }

    // "Beginning Case 1." or "Starting Case 2" (header only)
    m = s.match(new RegExp(`^(?:beginning|starting)\\s+case\\s+(${ROMAN})\\s*\\.?\\s*$`, 'i'));
    if (m) {
      out.push(`${indent}Case ${m[1]} Begins`);
      continue;
    }

    // "Let's begin. Case 1: stem..." or "Let's begin Case 1: stem"
    m = s.match(
      new RegExp(
        `^let(?:'|\\u2019)s\\s+begin\\.?\\s*case\\s+(${ROMAN})\\s*:\\s*(.+)$`,
        'i'
      )
    );
    if (m) {
      out.push(`${indent}Case ${m[1]} Begins`);
      out.push(`${indent}${m[2].trim()}`);
      continue;
    }

    m = s.match(
      new RegExp(
        `^let(?:'|\\u2019)s\\s+begin\\.?\\s*case\\s+(${ROMAN})\\s*:?\\s*$`,
        'i'
      )
    );
    if (m) {
      out.push(`${indent}Case ${m[1]} Begins`);
      continue;
    }

    // "Case 1: A 37-year-old..." (colon + stem same line)
    m = s.match(new RegExp(`^case\\s+(${ROMAN})\\s*:\\s*(.+)$`, 'i'));
    if (m && m[2].trim().length > 0) {
      out.push(`${indent}Case ${m[1]} Begins`);
      out.push(`${indent}${m[2].trim()}`);
      continue;
    }

    m = s.match(new RegExp(`^case\\s+(${ROMAN})(\\s+begins)?\\b(.*)$`, 'i'));
    if (!m) {
      out.push(line);
      continue;
    }
    const num = m[1];
    const rest = (m[3] || '').replace(/^[:\s.—\-]+/i, '').trim();
    out.push(`${indent}Case ${num} Begins`);
    if (rest) out.push(`${indent}${rest}`);
  }

  return out.join('\n');
}

function stripForOralBoardDisplay(text: string): string {
  let t = text
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/<\/[a-zA-Z][a-zA-Z0-9-]*>/g, '');
  t = t.replace(/<[a-zA-Z][a-zA-Z0-9-]*(?:\s[^>]*)?>/g, '');
  return t;
}

function splitIntoCaseChunks(text: string): string[] {
  const lines = text.split('\n');
  const chunks: string[] = [];
  let buf: string[] = [];

  const flush = () => {
    const s = buf.join('\n').trimEnd();
    if (s.length > 0) chunks.push(s);
    buf = [];
  };

  for (const line of lines) {
    const isCaseHeaderLine = CASE_HEADER_LINE.test(line.trim());
    if (isCaseHeaderLine && buf.length > 0) {
      flush();
    }
    buf.push(line);
  }
  flush();
  return chunks.length > 0 ? chunks : [text];
}

function firstLineIsCaseHeader(chunk: string): boolean {
  const first = chunk.split('\n')[0]?.trim() ?? '';
  return CASE_HEADER_LINE.test(first);
}

const markdownComponents = {
  h1: ({ node: _n, ...props }: ComponentPropsWithoutRef<'h1'> & { node?: unknown }) => (
    <h1 className="text-base font-bold mt-3 mb-2 text-foreground first:mt-0" {...props} />
  ),
  h2: ({ node: _n, ...props }: ComponentPropsWithoutRef<'h2'> & { node?: unknown }) => (
    <h2 className="text-sm font-semibold mt-3 mb-1.5 text-foreground first:mt-0" {...props} />
  ),
  h3: ({ node: _n, ...props }: ComponentPropsWithoutRef<'h3'> & { node?: unknown }) => (
    <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground first:mt-0" {...props} />
  ),
  p: ({ node: _n, ...props }: ComponentPropsWithoutRef<'p'> & { node?: unknown }) => (
    <p className="my-1.5 text-foreground/90 leading-relaxed whitespace-pre-wrap first:mt-0 last:mb-0" {...props} />
  ),
  ul: ({ node: _n, ...props }: ComponentPropsWithoutRef<'ul'> & { node?: unknown }) => (
    <ul className="list-disc list-outside pl-4 space-y-1 my-2 text-foreground/90" {...props} />
  ),
  ol: ({ node: _n, ...props }: ComponentPropsWithoutRef<'ol'> & { node?: unknown }) => (
    <ol className="list-decimal list-outside pl-4 space-y-1 my-2 text-foreground/90" {...props} />
  ),
  li: ({ node: _n, ...props }: ComponentPropsWithoutRef<'li'> & { node?: unknown }) => (
    <li className="leading-relaxed" {...props} />
  ),
  strong: ({ node: _n, ...props }: ComponentPropsWithoutRef<'strong'> & { node?: unknown }) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  em: ({ node: _n, ...props }: ComponentPropsWithoutRef<'em'> & { node?: unknown }) => (
    <em className="italic text-foreground/90" {...props} />
  ),
  hr: ({ node: _n, ...props }: ComponentPropsWithoutRef<'hr'> & { node?: unknown }) => (
    <hr className="my-3 border-border/60" {...props} />
  ),
  blockquote: ({ node: _n, ...props }: ComponentPropsWithoutRef<'blockquote'> & { node?: unknown }) => (
    <blockquote
      className="border-l-2 border-primary/40 pl-3 my-2 text-muted-foreground italic"
      {...props}
    />
  ),
  a: ({ node: _n, ...props }: ComponentPropsWithoutRef<'a'> & { node?: unknown }) => (
    <a className="text-primary underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  code: ({
    node: _n,
    className,
    children,
    ...props
  }: ComponentPropsWithoutRef<'code'> & { node?: unknown }) => {
    const isBlock = Boolean(className?.includes('language-'));
    if (isBlock) {
      return (
        <code
          className="block my-2 p-2 rounded-md bg-muted/80 text-xs font-mono overflow-x-auto"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className="px-1 py-0.5 rounded bg-muted/80 text-xs font-mono" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ node: _n, ...props }: ComponentPropsWithoutRef<'pre'> & { node?: unknown }) => (
    <pre className="my-2 overflow-x-auto rounded-md bg-muted/40 p-2 text-xs font-mono" {...props} />
  ),
};

const casePanelClass =
  'rounded-lg border border-border/60 bg-muted/45 dark:bg-slate-800/55 px-3 py-2.5 shadow-sm';

/**
 * @param variant `initial` — first assistant reply: case blocks get panels at each "Case N Begins".
 *   `followUp` — entire message in one panel (headers still normalized to "Case N Begins").
 */
export function OralBoardAssistantContent({
  content,
  variant = 'initial',
}: {
  content: string;
  variant?: 'initial' | 'followUp';
}) {
  const cleaned = normalizeOralBoardCaseHeaders(
    normalizeCommandHelpHeaders(stripForOralBoardDisplay(content))
  );

  if (variant === 'followUp') {
    return (
      <div className={casePanelClass}>
        <ReactMarkdown skipHtml components={markdownComponents}>
          {cleaned}
        </ReactMarkdown>
      </div>
    );
  }

  const chunks = splitIntoCaseChunks(cleaned);

  return (
    <div className="space-y-3">
      {chunks.map((chunk, i) => {
        const isCase = firstLineIsCaseHeader(chunk);
        const body = (
          <ReactMarkdown skipHtml components={markdownComponents}>
            {chunk}
          </ReactMarkdown>
        );
        if (isCase) {
          return (
            <div key={i} className={casePanelClass}>
              {body}
            </div>
          );
        }
        return (
          <div key={i} className="min-w-0">
            {body}
          </div>
        );
      })}
    </div>
  );
}
