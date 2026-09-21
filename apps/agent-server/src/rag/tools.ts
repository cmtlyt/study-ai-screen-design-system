import { tool } from 'langchain';
import { createEmbeddingModel } from '../ai/model';
import { searchKnowledgeDatabase } from './database';
import z from 'zod';

export const searchEChartsOptions = tool(
  async ({ query, limit }) => {
    console.debug('search_echarts_options =>', { query, limit });

    const embeddings = createEmbeddingModel();
    const vecotr = await embeddings.embedQuery(query);

    const chunks = searchKnowledgeDatabase(vecotr, Math.max(1, Math.min(10, limit ?? 3)));

    console.debug('search_echarts_options result =>', chunks, chunks.length);

    return JSON.stringify(
      chunks
        .map((chunk: any) => {
          return { path: chunk.path, description: chunk.description, distance: chunk.distance };
        })
        .sort((a, b) => b.distance - a.distance),
    );
  },
  {
    name: 'search_echarts_options',
    description:
      '查询 ECharts 官方 option 配置, 创建或修改 ECharts 图标时, 如果需要确认配置字段/嵌套路径或字段含义, 可以调用此工具',
    schema: z.object({
      query: z.string().describe('需要查询的 ECharts 配置问题, 例如: 柱状图柱宽如何配置'),
      limit: z
        .number()
        .min(1)
        .max(10)
        .nullable()
        .describe('需要查询文章的数量上限, 默认 3 篇通常够用, 除非没找到才需要查找多篇'),
    }),
  },
);
