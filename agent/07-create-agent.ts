import { tool } from '@langchain/core/tools';
import z from 'zod';
import { createAgent } from 'langchain';
import { createModel } from './utils/create-model';

function getVueConfCity() {
  console.debug('查询 VueConf 举办城市');
  return '最近 VueConf 大会在上海举办';
}

function getWeather({ city }: { city: string }) {
  console.debug(`查询 ${city} 的天气`);
  return `${city} 的天气是晴天, 气温 26 度`;
}

const getVueConfCityTool = tool(getVueConfCity, {
  name: 'get_vue_conf_city',
  description: '获取最近 VueConf 举办城市',
  schema: z.object({}),
});

const getWeatherTool = tool(getWeather, {
  name: 'get_weather',
  description:
    '获取指定城市天气信息, 只有用户明确提供了城市, 或者通过某些却低估的工具查询到城市, 才可以调用, 禁止猜测',
  schema: z.object({
    city: z.string().describe('城市名称'),
  }),
});

const { chatModel } = createModel('');

const agent = createAgent({
  model: chatModel,
  tools: [getVueConfCityTool, getWeatherTool],
  systemPrompt:
    '你是一个旅游规划助手, 根据用户提供的信息帮助用户合理的规划一下出行, 注意需要结合天气, 景点以及用户的需求合理安排, 并提出出行过程中需要注意的事项',
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: 'user',
        content:
          '我最近想出去旅游, 有可能的话顺便参加一下 VueConf 大会, 你帮我查一下大会最近在哪里举办, 然后那边天气怎么样? 适合旅游吗? 顺便帮我看看北京的天气, 因为我可能会优先考虑去北京',
      },
    ],
  },
  {
    recursionLimit: 7,
  },
);

console.debug(result.messages.map((item) => ({ role: item.type, content: item.content })));
