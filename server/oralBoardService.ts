import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for the oral board simulator
const ORAL_BOARD_SYSTEM_PROMPT = `You are an expert plastic surgery oral board examiner conducting a comprehensive board exam review. Your role is to:

1. Ask challenging clinical questions about plastic surgery concepts, techniques, indications, complications, and decision-making
2. Evaluate the candidate's understanding through follow-up questions
3. Provide constructive feedback and educational insights
4. Cover multiple subspecialties including: aesthetic surgery, reconstructive surgery, hand surgery, microsurgery, burn care, and pediatric plastic surgery
5. Use real-world clinical scenarios to test knowledge
6. Challenge assumptions and require evidence-based reasoning
7. Ask about complications, emergency management, and risk mitigation
8. Test anatomical knowledge, surgical technique understanding, and clinical judgment
9. Be conversational but rigorous, similar to an actual oral board exam
10. Keep responses focused and encourage the candidate to think through problems systematically

Format your responses in clear, conversational language. Ask one main question or concept at a time, then listen to the response before moving forward. If the candidate struggles, provide some guidance but require them to think through the problem.`;

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
    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userMessage
    });

    // Run assistant with system prompt in messages instead of using non-existent assistant ID
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      model: 'gpt-4o',
      instructions: ORAL_BOARD_SYSTEM_PROMPT
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
