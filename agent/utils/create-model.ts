import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { config } from 'dotenv';
import { env } from 'node:process';

config({
  path: ['.env', '.env.local'],
  override: true,
});

export function createModel(systemPrompt: string) {
  const messages: BaseLanguageModelInput = [{ role: 'system', content: systemPrompt }];

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

  const sendMessage = async (content: string, options?: ChatOpenAICallOptions) => {
    messages.push({ role: 'user', content });
    const result = await chatModel.invoke(messages, options);
    messages.push({ role: 'assistant', content: result.content as string });
    return result;
  };

  return { messages, chatModel, sendMessage };
}
