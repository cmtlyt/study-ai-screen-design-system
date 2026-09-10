import { Runnable } from '@langchain/core/runnables';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { env } from 'process';

export function createModelOnly<T extends DynamicStructuredTool[] | undefined = undefined>(
  toolList?: T,
): T extends undefined ? ChatOpenAI : Runnable {
  let chatModel = new ChatOpenAI({
    model: env.AI_MODEL,
    configuration: {
      baseURL: env.AI_BASE_URL,
      apiKey: env.AI_API_KEY,
    },
    modelKwargs: {
      store: false,
      chat_template_kwargs: {
        enable_thinking: false,
      },
    },
  });

  if (toolList) {
    chatModel = chatModel.bindTools(toolList) as any;
  }

  return chatModel;
}
