import { ChatOpenAI } from '@langchain/openai';
import { config } from 'dotenv';
import { env } from 'node:process';
import { readFileSync } from 'node:fs';
import { input } from '@inquirer/prompts';
import { symmaryMessages } from './utils/summary';

config({
  path: ['.env', '.env.local'],
  override: true,
});

const SYSTEM_PROMPT = readFileSync(new URL('../prompts/AGENTS.md', import.meta.url), 'utf-8');

const chatModel = new ChatOpenAI({
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

const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendMessage(): Promise<any> {
  return chatModel
    .invoke([{ role: 'system', content: SYSTEM_PROMPT }, ...messages])
    .catch(async (error) => {
      console.debug(error.message);
      await sleep(3000);
      return sendMessage();
    });
}

while (true) {
  const content = await input({ message: '#>', theme: { prefix: '' } });

  await symmaryMessages(messages, 12, 10);

  messages.push({ role: 'user', content });

  const result = await sendMessage();

  messages.push({ role: 'assistant', content: result.content as string });

  console.debug(result.content);
}
