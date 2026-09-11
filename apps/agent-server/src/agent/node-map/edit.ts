import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { defineNode } from '../define';
import { State } from '../state';
import { createNoStreamModel } from '../../ai/model';
import { z } from 'zod';
import { getLastUserMessage } from '../../utils';

async function getMaterialSchema(state: State) {
  const { schema } = state;

  const { material: materialSchema } = schema;
  const materials = materialSchema.map((item) => {
    return {
      type: item.type,
      name: item.name,
    };
  });

  const model = createNoStreamModel().withStructuredOutput(
    z.object({
      type: z.enum(materialSchema.map((item) => item.type as string)),
    }),
    { name: 'material_schema', method: 'jsonSchema' },
  );

  const result = await model.invoke([
    new SystemMessage(
      `你是一个 AI 大屏设计器的物料 schema 识别助手, 请根据用户输入的内容判断用户的物料的类型\n\n可用物料:\n${JSON.stringify(materials)}`,
    ),
    getLastUserMessage(state.messages)!,
  ]);

  return materialSchema.find((item) => item.type === result.type);
}

async function generateNode(
  state: State,
  materialSchema: Awaited<ReturnType<typeof getMaterialSchema>>,
) {
  if (!materialSchema) return null;
  const schema = (z.fromJSONSchema(materialSchema.schema) as any).extend({
    id: z.literal(crypto.randomUUID()),
  });
  console.debug('schema:', schema);
  const model = createNoStreamModel().withStructuredOutput(
    z.object({
      node: schema,
    }),
    {
      name: 'node_schema',
      method: 'jsonSchema',
    },
  );
  console.debug('model:', model);

  const result = await model.invoke([
    new SystemMessage(
      `你是一个 AI 大屏设计器的物料 schema 识别助手, 请根据用户输入的内容生成${materialSchema.name}物料的配置\n\n物料 schema:\n${JSON.stringify(materialSchema.schema)}`,
    ),
    getLastUserMessage(state.messages)!,
  ]);

  console.debug('node:', result);
  return result.node;
}

export const editTaskHandler = defineNode(async (state) => {
  const { classifycation } = state;

  if (classifycation?.operation === 'add_node') {
    const schema = await getMaterialSchema(state);
    const node = await generateNode(state, schema);
    return { action: { type: 'add_node', node } };
  }

  return {
    messages: [new AIMessage('接收到任务: 根据用户的需求, 修改大屏页面')],
  };
});
