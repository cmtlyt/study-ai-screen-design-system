import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createModelOnly } from '../../ai/model';
import { State } from '../state';

export async function answerMessage(state: State) {
  console.log('Current state:', state);
  const { messages, page, selectedNodeIds, schema } = state;
  const { nodes, canvas } = page;
  const { material: materialSchema, canvas: canvasSchema } = schema;

  const model = createModelOnly();
  const lastMessage = messages.at(-1)!;
  const result = await model.invoke([
    new SystemMessage(`你是一个AI大屏设计器助手, 帮助用户设计大屏界面`),
    new HumanMessage(
      `以下是 canvas 画布的 schema 定义\n${JSON.stringify(canvasSchema)}\n\n以下是 material 物料的 schema 定义\n${JSON.stringify(materialSchema)}`,
    ),
    ...messages.slice(0, -1),
    new HumanMessage(
      `当前设计器状态: ${JSON.stringify({ nodes, canvas, selectedNodeIds })}\n\n其中:\n- nodes: 当前页面的所有节点\n- canvas: 当前话不的属性信息, 包括画布的宽高背景色等\n- selectedNodeIds: 当前选中的节点 ID 列表`,
    ),
    lastMessage,
  ]);
  return {
    messages: [result],
  };
}
