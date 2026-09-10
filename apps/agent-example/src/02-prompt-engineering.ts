import { ChatOpenAI } from '@langchain/openai';
import { config } from 'dotenv';
import { env } from 'node:process';
import { readFileSync } from 'node:fs';

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

const result = await chatModel.invoke([
  { role: 'system', content: SYSTEM_PROMPT },
  { role: 'user', content: '分析一下不同循环语句的性能' },
]);

console.debug(result.content);
