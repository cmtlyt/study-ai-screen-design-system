import { tool } from '@langchain/core/tools';
import { createModel } from './utils/create-model';
import z from 'zod';

const { chatModel, messages } = createModel('');

function getWeather({ city }: { city: string }) {
  return `${city} 今天晴, 气温 26 度`;
}

const getWeatherTool = tool(getWeather, {
  name: 'get_weather',
  description: '获取指定城市天气信息',
  schema: z.object({
    city: z.string().describe('城市名称'),
  }),
});

const modelWithTools = chatModel.bindTools([getWeatherTool]);

messages.push({ role: 'user', content: '今天北京天气如何' });

const result = await modelWithTools.invoke(messages);

messages.push(result);

if (result.tool_calls) {
  const toolCall = result.tool_calls[0];
  const toolResult = await getWeatherTool.invoke(toolCall);
  console.debug(toolResult);
  messages.push({ role: 'tool', content: toolResult.content, tool_call_id: toolCall.id });
  const newResult = await modelWithTools.invoke(messages);
  console.debug(newResult);
}
