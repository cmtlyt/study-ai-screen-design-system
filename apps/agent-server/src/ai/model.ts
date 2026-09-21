import { Runnable } from '@langchain/core/runnables';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatOpenAI, ChatOpenAIFields } from '@langchain/openai';
import { OllamaEmbeddings, OllamaEmbeddingsParams } from '@langchain/ollama';
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

class Qwen3Embeddings extends OllamaEmbeddings {
  private defaultInstruct?: string;
  constructor(options?: OllamaEmbeddingsParams & { queryInstruction?: string }) {
    const { queryInstruction, ...fields } = options || {};

    super(fields);

    this.defaultInstruct = queryInstruction;
  }

  async embedQuery(rawText: string, instruct?: string) {
    const _instruct = instruct || this.defaultInstruct;
    if (_instruct) {
      const prompt = `Instruct: ${_instruct}\nQuery: ${rawText}`;
      return super.embedQuery(prompt);
    }
    return super.embedQuery(rawText);
  }
}

export function createEmbeddingModel(instruct?: string) {
  return new Qwen3Embeddings({
    model: 'qwen3-embedding',
    baseUrl: 'http://127.0.0.1:11434',
    maxConcurrency: 1,
    maxRetries: 0,
    dimensions: 1024,
    queryInstruction: instruct,
  });
}
