import z from 'zod';
import { defineNode } from '../define';
import { createModelOnly } from '../../ai/model';
import { SystemMessage } from '@langchain/core/messages';
import { getLastUserMessage } from '../../utils';

export const classifycationSchema = z.object({
  task: z
    .enum(['page', 'ask', 'edit'])
    .describe('任务类型: page-大屏设计, ask-问题回答, edit-编辑'),
});

export const classifyTaskHandler = defineNode(async (state) => {
  const model = createModelOnly(void 0, {
    disableStreaming: true,
  }).withStructuredOutput(classifycationSchema, {
    name: 'task_classifycation',
    method: 'jsonSchema',
  });

  const result = await model.invoke(
    [
      new SystemMessage(
        `你是一个 AI 大屏设计器的意图识别助手, 请根据用户输入的内容判断用户的意图属于哪一类任务, 并返回对应的任务类型\n\n任务类型:
- ask: 普通问答, 用户只是想问一些问题, 或者获取一些信息
- page: 创建页面, 用户想用一句话或者一段综合描述, 直接生成一个大屏
- edit: 修改页面, 用户想要修改现有的页面, 或者调整组件的属性, 或者新增一个节点`,
      ),
      getLastUserMessage(state.messages)!,
    ],
    { tags: ['nostream'] },
  );

  return {
    classifycation: result,
  };
});
