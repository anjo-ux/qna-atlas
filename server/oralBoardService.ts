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
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// In-memory thread storage (in production, store in database)
const threads = new Map<string, AssistantThread>();

export async function initializeThread(): Promise<string> {
  try {
    const threadId = Math.random().toString(36).substring(2);
    threads.set(threadId, {
      id: threadId,
      createdAt: new Date(),
      conversationHistory: []
    });
    return threadId;
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

    // Add user message to history
    thread.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // Prepare messages for API call
    const messages = [
      {
        role: 'system' as const,
        content: ORAL_BOARD_SYSTEM_PROMPT
      },
      ...thread.conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ];

    // Call OpenAI chat completions
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1024,
      temperature: 0.7
    });

    // Extract response text
    const assistantMessage = response.choices[0].message.content;
    if (!assistantMessage) {
      throw new Error('No response from assistant');
    }

    // Add assistant response to history
    thread.conversationHistory.push({
      role: 'assistant',
      content: assistantMessage
    });

    return assistantMessage;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('Failed to process message');
  }
}

export function validateThreadExists(threadId: string): boolean {
  return threads.has(threadId);
}
