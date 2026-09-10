import { ChatOpenAI } from '@langchain/openai';
import { config } from 'dotenv';
import { env } from 'node:process';
import { z } from 'zod';

config({
  path: ['.env', '.env.local'],
  override: true,
});

const SYSTEM_PROMPT = `你负责从用户输入中提取用户信息`;

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

const userInfoModel = chatModel.withStructuredOutput(
  z.looseObject({
    name: z.string(),
    age: z.number(),
    address: z.string(),
  }),
  {
    name: 'userInfo',
    method: 'jsonSchema',
  },
);

const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

async function sendMessage(): Promise<any> {
  return userInfoModel
    .invoke([{ role: 'system', content: SYSTEM_PROMPT }, ...messages])
    .catch((error) => {
      console.debug(error.message);
      return {};
    });
}

messages.push({ role: 'user', content: '我叫做张三, 今年18岁, 在北京' });

const result = await sendMessage();

console.debug(result.content);
