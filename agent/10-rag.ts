import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { config } from 'dotenv';
import { Document } from 'langchain';
import { env } from 'node:process';
import { createModelOnly } from './utils/create-model';

config({
  path: ['.env', '.env.local'],
  override: true,
});

// export const embeddings = new OpenAIEmbeddings({
//   model: 'text-embedding-3-large',
//   batchSize: 10,
//   apiKey: env.AI_API_KEY,
//   dimensions: 1024,
//   configuration: {
//     baseURL: env.AI_BASE_URL,
//   },
// });

// const vector = await embeddings.embedQuery('猫');

// console.debug(vector, vector.length);

const docs = [
  new Document({
    pageContent: '小明喜欢清淡口味, 不太能吃辣, 不吃香菜, 比较喜欢番茄、鸡蛋和虾',
    metadata: {
      name: '小明的口味',
    },
  }),
  new Document({
    pageContent: '小红喜欢甜口口味, 比较喜欢甜品、水果和甜食',
    metadata: {
      name: '小红的口味',
    },
  }),
  new Document({
    pageContent:
      '未使用七天内可以退货, 已使用七天内出现质量问题可以退货, 十五天内可以换货, 如果因为用户个人原因损坏, 不予退换货',
    metadata: {
      name: '退换货流程',
    },
  }),
];

// const question = '我从淘宝买的手机摔了一下, 不能用了';
const question = '我今晚想吃辣椒炒肉可以吗?';

export const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-large',
  batchSize: 10,
  apiKey: env.AI_API_KEY,
  dimensions: 1024,
  configuration: {
    baseURL: env.AI_BASE_URL,
  },
});

const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

// 返回匹配的文档
// const matchedDocs = await vectorStore.similaritySearch(question, 2);

// 返回匹配的文档和分数
const matchedDocs2 = await vectorStore.similaritySearchWithScore(question, 2);

// console.debug('matchedDocs', matchedDocs, '\n\nmatchedDocs2', matchedDocs2);

const context = matchedDocs2
  .map((item) => {
    const [doc, score] = item;
    return `文档${doc.metadata.name}(分数: ${score}): ${doc.pageContent}`;
  })
  .join('\n');

const chatModel = createModelOnly();

const result = await chatModel.invoke([
  { role: 'user', content: `检索到的资料: ${context}` },
  { role: 'user', content: question },
]);

console.debug('result', result.content);
