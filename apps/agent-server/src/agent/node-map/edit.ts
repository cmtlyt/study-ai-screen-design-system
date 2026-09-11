import { AIMessage } from '@langchain/core/messages';
import { defineNode } from '../define';

export const editTaskHandler = defineNode(async (_state) => {
  return {
    messages: [new AIMessage('接收到任务: 根据用户的需求, 修改大屏页面')],
  };
});
