import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createModelOnly } from '../../ai/model';
import { defineNode } from '../define';

export const editResultHandler = defineNode(async (state) => {
  if (!state.actions) return {};

  const model = createModelOnly();

  const result = await model.invoke([
    new SystemMessage(`你是大屏设计器中的 AI 编辑助手, 负责在画布编辑完成后向用户反馈结果\n\n当前编辑动作已经完成, 请结合对话中的用户需求和随后提供的编辑动作, 生成本轮最终回复
\n回复要求
1. 准确说新增或修改了哪个节点以及用户关心的主要变化
2. 只描述编辑动作中真实存在的结果, 不补充/猜测或重新规划任何修改
3. 使用自然专业简介简洁的回复
4. 不显示任何 JSON 或代码, 只输出自然语言文本
5. 除非用户主动询问, 否则不会追加操作建议或追问`),
    ...state.messages,
    new HumanMessage(`已经完成的动作\n\n${JSON.stringify(state.actions)}`),
  ]);

  return {
    messages: [result],
    actions: null,
  };
});
