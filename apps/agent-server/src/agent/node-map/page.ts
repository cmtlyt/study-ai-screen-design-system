import { AIMessage } from '@langchain/core/messages';
import { defineNode } from '../define';

export const pageTaskHandler = defineNode((_state) => {
  return {
    messages: [new AIMessage('接收到任务: 根据用户的需求, 生成一个大屏页面')],
  };
});
