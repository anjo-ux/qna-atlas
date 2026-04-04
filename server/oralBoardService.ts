import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_ASSISTANT_API_KEY,
});

/** Create a new OpenAI thread for an oral board session (persist row in storage separately). */
export async function createOpenAIThread(): Promise<string> {
  try {
    const thread = await openai.beta.threads.create();
    return thread.id;
  } catch (error) {
    console.error('Failed to create OpenAI thread:', error);
    throw new Error('Failed to initialize oral board session');
  }
}

/**
 * Runs the oral-board assistant and forwards streamed text deltas.
 * Resolves to the full assistant message text when the run completes successfully.
 */
export async function sendMessageWithStream(
  threadId: string,
  userMessage: string,
  onTextDelta: (chunk: string) => void
): Promise<string> {
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: userMessage,
  });

  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  if (!assistantId) {
    throw new Error('OPENAI_ASSISTANT_ID environment variable not set');
  }

  const runStream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });

  let accumulated = '';

  await new Promise<void>((resolve, reject) => {
    runStream.on('textDelta', (delta: { value?: string }) => {
      const piece = delta.value ?? '';
      accumulated += piece;
      onTextDelta(piece);
    });
    runStream.on('error', (err: unknown) => {
      reject(err instanceof Error ? err : new Error(String(err)));
    });
    void runStream
      .finalRun()
      .then((run) => {
        if (run.status !== 'completed') {
          const lastError = run.last_error;
          const detail = lastError
            ? `${lastError.code}: ${lastError.message}`
            : run.incomplete_details
              ? `incomplete: ${run.incomplete_details.reason ?? 'unknown'}`
              : 'no API error details';
          console.error('Oral board assistant run finished unsuccessfully:', {
            status: run.status,
            detail,
            assistantId,
          });
          reject(new Error(`Run ended with status "${run.status}" — ${detail}`));
          return;
        }
        resolve();
      })
      .catch(reject);
  });

  if (!accumulated.trim()) {
    throw new Error('No response from assistant');
  }

  return accumulated;
}

/** Non-streaming: same pipeline, deltas discarded (e.g. legacy clients). */
export async function sendMessage(threadId: string, userMessage: string): Promise<string> {
  try {
    return await sendMessageWithStream(threadId, userMessage, () => {});
  } catch (error) {
    console.error('Failed to send message:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to process message');
  }
}
