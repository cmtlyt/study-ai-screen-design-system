import { createAgent, tool, summarizationMiddleware, toolCallLimitMiddleware } from 'langchain';
import { z } from 'zod';
import { createModelOnly } from './utils/create-model';
import { SUMMARY_SYSTEM_PROMPT, symmaryModel } from './utils/summary';
import { formatOutput } from './utils/format-output';
import { MemorySaver } from '@langchain/langgraph';

const chatModel = createModelOnly();

function getWeather({ city }: { city: string }) {
  console.debug(`查询 ${city} 的天气`);
  return `${city} 的天气是晴天, 气温 26 度`;
}

const getWeatherTool = tool(getWeather, {
  name: 'get_weather',
  description:
    '获取指定城市天气信息, 只有用户明确提供了城市, 或者通过某些却低估的工具查询到城市, 才可以调用, 禁止猜测',
  schema: z.object({
    city: z.string().describe('城市名称'),
  }),
});

const agent = createAgent({
  model: chatModel,
  tools: [getWeatherTool],
  checkpointer: new MemorySaver(),
  middleware: [
    summarizationMiddleware({
      model: symmaryModel,
      trigger: { tokens: 30 },
      keep: { messages: 2 },
      summaryPrompt: `${SUMMARY_SYSTEM_PROMPT}\n\n{messages}`,
      summaryPrefix: '前面对话的摘要:',
    }),
    toolCallLimitMiddleware({
      toolName: 'get_weather',
      runLimit: 2,
      exitBehavior: 'continue',
    }),
  ],
});

const threadConfig = {
  configurable: {
    thread_id: 'test-user',
  },
};

await agent
  .invoke({ messages: [{ role: 'user', content: '查询一下上海北京和南京的天气' }] }, threadConfig)
  .then((res) => {
    const messages = formatOutput(res);
    console.debug(messages);
  });
