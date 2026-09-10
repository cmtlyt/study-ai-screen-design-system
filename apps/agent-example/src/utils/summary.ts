import { ChatOpenAI } from '@langchain/openai';
import { config } from 'dotenv';
import { env } from 'node:process';
import { readFileSync } from 'node:fs';

config({
  path: ['.env', '.env.local'],
  override: true,
});

export const SUMMARY_SYSTEM_PROMPT = readFileSync(
  new URL('../../prompts/symmary.md', import.meta.url),
  'utf-8',
);

export const symmaryModel = new ChatOpenAI({
  model: env.AI_MODEL,
  configuration: {
    baseURL: env.AI_BASE_URL,
    apiKey: env.AI_API_KEY,
  },
  modelKwargs: {
    chat_template_kwargs: {
      enable_thinking: false,
    },
  },
});

export async function symmaryMessages(
  messages: Array<{ role: string; content: string }>,
  len = 12,
  symmaryCount = len - 2,
) {
  if (messages.length < len) {
    return messages;
  }

  const oldMessages = messages.splice(0, symmaryCount);

  const result = await symmaryModel.invoke([
    { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
    { role: 'user', content: JSON.stringify(oldMessages) },
  ]);

  messages.unshift({ role: 'assistant', content: result.content as string });

  return messages;
}
