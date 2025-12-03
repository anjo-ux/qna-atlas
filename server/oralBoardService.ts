import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_ASSISTANT_API_KEY,
});

interface AssistantThread {
  id: string;
  createdAt: Date;
}

// In-memory thread storage (in production, store in database)
const threads = new Map<string, AssistantThread>();

export async function initializeThread(): Promise<string> {
  try {
    const thread = await openai.beta.threads.create();
    threads.set(thread.id, {
      id: thread.id,
      createdAt: new Date()
    });
    return thread.id;
  } catch (error) {
    console.error('Failed to create thread:', error);
    throw new Error('Failed to initialize oral board session');
  }
}

export async function sendMessage(threadId: string, userMessage: string): Promise<string> {
  try {
    const thread = threads.get(threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userMessage
    });

    // Get the assistant ID from environment or use default
    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    if (!assistantId) {
      throw new Error('OPENAI_ASSISTANT_ID environment variable not set');
    }

    // Run assistant
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId
    });

    // Check run status
    if (run.status !== 'completed') {
      throw new Error(`Run failed with status: ${run.status}`);
    }

    // Get messages from thread
    const messages = await openai.beta.threads.messages.list(threadId);

    // Find the last assistant message
    const lastAssistantMessage = messages.data.find(
      (msg: any) => msg.role === 'assistant'
    );

    if (!lastAssistantMessage || lastAssistantMessage.content[0].type !== 'text') {
      throw new Error('No response from assistant');
    }

    return lastAssistantMessage.content[0].text;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('Failed to process message');
  }
}

export function validateThreadExists(threadId: string): boolean {
  return threads.has(threadId);
}
