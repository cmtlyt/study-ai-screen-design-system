import { Runnable } from '@langchain/core/runnables';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatOpenAI, ChatOpenAIFields } from '@langchain/openai';
import { env } from 'process';

export function createModelOnly<T extends DynamicStructuredTool[] | undefined = undefined>(
  toolList?: T,
  options?: ChatOpenAIFields,
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
    ...options,
  });

  if (toolList?.length) {
    chatModel = chatModel.bindTools(toolList) as any;
  }

  return chatModel;
}

export function createNoStreamModel<T extends DynamicStructuredTool[] | undefined = undefined>(
  toolList?: T,
  options?: ChatOpenAIFields,
) {
  return createModelOnly<T>(toolList, {
    disableStreaming: true,
    tags: ['nostream'],
    ...options,
  });
}
