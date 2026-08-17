import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { BaseMessageLike } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { config } from 'dotenv';
import { env } from 'node:process';

config({
  path: ['.env', '.env.local'],
  override: true,
});

export function createModel<T extends DynamicStructuredTool[] | undefined = undefined>(
  systemPrompt: string,
  toolList?: T,
) {
  const messages: BaseLanguageModelInput = systemPrompt
    ? [{ role: 'system', content: systemPrompt }]
    : [];

  let chatModel = new ChatOpenAI({
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

  if (toolList) {
    chatModel = chatModel.bindTools(toolList) as any;
  }

  const sendMessage = async (message: BaseMessageLike, options?: ChatOpenAICallOptions) => {
    messages.push(message);
    const result = await chatModel.invoke(messages, options);
    messages.push(result);
    return result;
  };

  const sendUserMessage = async (content: string, options?: ChatOpenAICallOptions) => {
    return sendMessage({ role: 'user', content }, options);
  };

  const findToolByName = (name: string) => {
    return toolList?.find((tool) => tool.name === name);
  };

  const invokeTool = async (toolCall: { id?: string; name: string; args: any }) => {
    const tool = findToolByName(toolCall.name);
    if (!tool) {
      throw new Error(`Tool ${toolCall.name} not found`);
    }
    const result = await tool.invoke(toolCall);
    messages.push(result);
    return result;
  };

  return {
    messages,
    chatModel: chatModel as T extends undefined ? ChatOpenAI : Runnable,
    sendMessage,
    sendUserMessage,
    findToolByName,
    invokeTool,
  };
}
