import fs from 'node:fs/promises';
import { createAgent, Document, tool } from 'langchain';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { config } from 'dotenv';
import { OpenAIEmbeddings } from '@langchain/openai';
import { env } from 'node:process';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { createModelOnly } from './utils/create-model';
import { MemorySaver } from '@langchain/langgraph';
import { input } from '@inquirer/prompts';
import { formatOutput } from './utils/format-output';
import z from 'zod';

config({
  path: ['.env', '.env.local'],
  override: true,
});

function normalizeMDPlainText(text: string) {
  return text
    .replace(/\r\n?/gu, '\n')
    .replace(/[ \t]+/gu, ' ')
    .replace(/\n{3,}/gu, '\n\n')
    .trim();
}

async function loadMarkdownDocs(filePath: string) {
  const markdown = await fs.readFile(filePath, 'utf8');

  return [
    new Document({
      pageContent: normalizeMDPlainText(markdown),
      metadata: {
        source: filePath,
      },
    }),
  ];
}

const mdRawDocs = await loadMarkdownDocs('./README.md');

const mdSplitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
  chunkSize: 160,
  chunkOverlap: 0,
});

const mdChunks = await mdSplitter.splitDocuments(mdRawDocs);

export const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-large',
  batchSize: 10,
  apiKey: env.AI_API_KEY,
  dimensions: 1024,
  configuration: {
    baseURL: env.AI_BASE_URL,
  },
});

const vectorStore = await MemoryVectorStore.fromDocuments([...mdChunks], embeddings);

const searchServiceRule = tool(
  async ({ query }) => {
    console.debug(`\n检索的问题: ${query}`);

    const matchedDocs = await vectorStore.similaritySearchWithScore(query, 5);

    const context = matchedDocs
      .map(
        ([doc, score], index) =>
          `资料${index + 1}(score: ${score}; source: ${doc.metadata.source}): ${doc.pageContent}`,
      )
      .join('\n---\n');

    return context;
  },
  {
    name: 'search_service_rule',
    description: '项目相关内容的检索',
    schema: z.object({
      query: z.string().describe('检索的问题'),
    }),
  },
);

const model = createModelOnly();

const agent = createAgent({
  model,
  tools: [searchServiceRule],
  checkpointer: new MemorySaver(),
});

const threadConfig = {
  configurable: {
    thread_id: 'test-user',
  },
};

while (true) {
  const question = await input({ message: '请输入问题 #>', theme: { prefix: '' } });

  const result = await agent.invoke(
    { messages: [{ role: 'user', content: question }] },
    threadConfig,
  );

  console.debug('result', formatOutput(result));
}
