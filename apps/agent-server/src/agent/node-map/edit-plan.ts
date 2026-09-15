import z from 'zod';
import { defineNode } from '../define';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createModelOnly, createNoStreamModel } from '../../ai/model';
import { ACTION_TYPES } from '../constants/action-types';

export const actionTypeSchema = z
  .enum(Object.values(ACTION_TYPES) as (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES][])
  .describe('编辑动作: add_node-新增节点, update_node-更新节点, remove_node-删除节点');

export const planEditSchema = z.object({
  id: z.string().nullable().describe('要操作的节点 ID, 新增的时候留空'),
  action: actionTypeSchema,
  type: z.string().describe('节点的类型'),
  prompt: z.string().describe('操作节点使用的提示词: 通过理解用户的意图, 重新生成更明确的提示词'),
});

export const editPlanTaskHandler = defineNode(async (state) => {
  const materials = state.schema.material.map((item) => {
    return {
      type: item.type,
      name: item.name,
    };
  });

  const nodes = (state.page.nodes as any[]) || [];

  const model = createNoStreamModel().withStructuredOutput(
    z.object({
      editPlan: z.array(
        planEditSchema.extend({
          id: nodes.length
            ? z
                .enum(nodes.map((item) => item.id as string))
                .nullable()
                .describe('要操作的节点 ID, 新增的时候留空')
            : planEditSchema.shape.id,
          type: z.enum(materials.map((item) => item.type as string)).describe('节点的类型'),
        }),
      ),
      message: z.string().nullable().describe('给用户的消息, 告诉用户缺少哪些信息'),
    }),
    {
      name: 'edit_plan',
      method: 'jsonSchema',
    },
  );

  const result = await model.invoke([
    new SystemMessage(
      `请把用户要求整理成执行顺序排列的 editPlan 每项只处理一个节点, 每项 prompt 必须能够独立说明该节点的内容/样式/布局的需求, 如果根据用户提示词无法完成要求或者用户目标不明确返回空的 editPlan 并通过 message 一次问清楚
\n除了新增节点之外, 其他的操作都需要 id 存在, 如果无法获取 id 则认为目标不明确, 编辑内容提示用户
\n可用物料: ${JSON.stringify(materials)}`,
    ),
    new HumanMessage(
      `已有节点: ${JSON.stringify(nodes)}
\n当前选中的节点: ${JSON.stringify(state.selectedNodeIds)}
\n画布信息: ${JSON.stringify(state.page.canvas)}`,
    ),
    ...state.messages,
  ]);

  if (!result.editPlan.length && result.message) {
    const chatModel = createModelOnly();
    const chatResult = await chatModel.invoke([
      new SystemMessage(
        `你是一个 AI 大屏的信息反馈助手, 当前根据已有信息无法完成任务, 请让用户提供足够的信息`,
      ),
      new HumanMessage(result.message),
    ]);
    return {
      messages: [chatResult],
      editPlan: null,
      actions: null,
    };
  }

  return {
    editPlan: result.editPlan,
  };
});
