import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { defineNode } from '../define';
import { State } from '../state';
import { createNoStreamModel } from '../../ai/model';
import { ACTION_TYPES } from '../constants/action-types';

type MaterialSchema = State['schema']['material'][number] | undefined;

async function generateNode(_state: State, materialSchema: MaterialSchema, prompt: string) {
  if (!materialSchema) return null;
  const schema = structuredClone(materialSchema.schema);
  (schema.properties as any).id.const = crypto.randomUUID();
  (schema.properties as any).type.const = materialSchema.type;
  const model = createNoStreamModel().withStructuredOutput(schema, {
    name: 'node_schema',
    method: 'jsonSchema',
  });

  const result = await model.invoke([
    new SystemMessage(
      `你是一个 AI 大屏设计器的物料 schema 识别助手, 请根据用户输入的内容生成${materialSchema.name}物料的配置\n\n物料 schema:\n${JSON.stringify(materialSchema.schema)}`,
    ),
    new HumanMessage(prompt),
  ]);

  return result;
}

async function updateNode(
  _state: State,
  selectedNode: any,
  materialSchema: MaterialSchema,
  prompt: string,
) {
  if (!materialSchema) return null;
  const schema = structuredClone(materialSchema.schema);
  (schema.properties as any).id.const = selectedNode.id;
  (schema.properties as any).type.const = selectedNode.type;

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
    new HumanMessage(prompt),
  ]);

  result.id = selectedNode.id;
  result.type = selectedNode.type;

  return result;
}

export const editTaskHandler = defineNode(async (state) => {
  const { editPlan: plans } = state;
  const actions: any[] = [];

  for (const plan of plans || []) {
    const { type, id, action, prompt } = plan;
    const schema = state.schema.material.find((item) => item.type === type);

    if (action === ACTION_TYPES.addNode) {
      const node = (await generateNode(state, schema, prompt)) || {};
      actions.push({ type: ACTION_TYPES.addNode, node });
    }

    if (action === ACTION_TYPES.updateNode) {
      const selectedNode = (state.page.nodes as any[]).find((node) => node.id === id);
      if (!selectedNode) {
        return { messages: [new AIMessage('未找到选中的节点')] };
      }

      const node = (await updateNode(state, selectedNode, schema, prompt)) || {};

      actions.push({ type: ACTION_TYPES.updateNode, node });
    }

    if (action === ACTION_TYPES.removeNode) {
      const selectedNode = (state.page.nodes as any[]).find((node) => node.id === id);
      if (!selectedNode) {
        return { messages: [new AIMessage('未找到选中的节点')] };
      }

      actions.push({ type: ACTION_TYPES.removeNode, node: selectedNode });
    }
  }

  return {
    actions,
    editPlan: null,
  };
});
