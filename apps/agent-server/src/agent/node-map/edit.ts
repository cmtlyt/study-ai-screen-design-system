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
  const schema = structuredClone(materialSchema.schema);
  (schema.properties as any).id.const = crypto.randomUUID();
  (schema.properties as any).message = {
    type: 'string',
    description: '告诉用户做了什么工作',
  };
  schema.required ||= [];
  (schema.required as string[]).push('message');
  const model = createNoStreamModel().withStructuredOutput(schema, {
    name: 'node_schema',
    method: 'jsonSchema',
  });

  const result = await model.invoke([
    new SystemMessage(
      `你是一个 AI 大屏设计器的物料 schema 识别助手, 请根据用户输入的内容生成${materialSchema.name}物料的配置\n\n物料 schema:\n${JSON.stringify(materialSchema.schema)}`,
    ),
    getLastUserMessage(state.messages)!,
  ]);

  return result;
}

async function updateNode(
  state: State,
  selectedNode: any,
  materialSchema: Awaited<ReturnType<typeof getMaterialSchema>>,
) {
  if (!materialSchema) return null;
  const schema = structuredClone(materialSchema.schema);
  (schema.properties as any).id.const = selectedNode.id;
  (schema.properties as any).message = {
    type: 'string',
    description: '告诉用户做了什么工作',
  };
  schema.required ||= [];
  (schema.required as string[]).push('message');
  const model = createNoStreamModel().withStructuredOutput(schema, {
    name: 'node_schema',
    method: 'jsonSchema',
  });

  const result = await model.invoke([
    new SystemMessage(
      `你是一个 AI 大屏设计器的物料节点修改助手, 当前选中的节点是${materialSchema.name}请根据用户的要求修改该节点, 对于可选属性用户没有明确要求可以留空
不允许修改节点的 id, type, name 属性, 这些属性是节点的唯一标识, 不能修改
\n当前节点的内容 schema:\n${JSON.stringify(selectedNode)}`,
    ),
    getLastUserMessage(state.messages)!,
  ]);

  result.id = selectedNode.id;
  result.type = selectedNode.type;

  return result;
}

export const editTaskHandler = defineNode(async (state) => {
  const { classifycation } = state;

  if (classifycation?.operation === 'add_node') {
    const schema = await getMaterialSchema(state);
    const { message, ...node } = (await generateNode(state, schema)) || {};
    return {
      messages: [new AIMessage(`节点生成成功: ${message}`)],
      action: { type: 'add_node', node },
    };
  }

  if (classifycation?.operation === 'update_node') {
    const selectedNodeId = state.selectedNodeIds[0];
    if (!selectedNodeId) {
      return { messages: [new AIMessage('请先选择一个节点')] };
    }

    const selectedNode = (state.page.nodes as any[]).find((node) => node.id === selectedNodeId);
    if (!selectedNode) {
      return { messages: [new AIMessage('未找到选中的节点')] };
    }

    const materialSchema = state.schema.material.find((item) => item.type === selectedNode.type);
    if (!materialSchema) {
      return { messages: [new AIMessage('未找到选中节点的物料 schema')] };
    }

    const { message, ...node } = (await updateNode(state, selectedNode, materialSchema)) || {};
    console.debug('Updated node:', node);

    return {
      messages: [new AIMessage(`节点修改成功: ${message}`)],
      action: { type: 'update_node', node, nodeId: selectedNodeId },
    };
  }

  return {
    messages: [new AIMessage('接收到任务: 根据用户的需求, 修改大屏页面')],
  };
});
