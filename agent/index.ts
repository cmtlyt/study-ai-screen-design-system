import { ChatOpenAI } from '@langchain/openai';
import { config } from 'dotenv';
import { input } from '@inquirer/prompts';
import { env } from 'node:process';

config();

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

const content = '你好'; //await input({ message: '#>' });

const result = await chatModel.invoke([{ role: 'user', content }]);

console.debug(result.content);
