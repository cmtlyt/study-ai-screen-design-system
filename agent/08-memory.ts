import { createAgent } from 'langchain';
import { createModelOnly } from './utils/create-model';
import { MemorySaver } from '@langchain/langgraph';

const chatModel = createModelOnly();

const agent = createAgent({
  model: chatModel,
  checkpointer: new MemorySaver(),
});

const threadConfig = {
  configurable: {
    thread_id: 'test-user',
  },
};

const result = await agent.invoke(
  {
    messages: [{ role: 'user', content: '我叫源悟, 我喜欢 JS' }],
  },
  threadConfig,
);

console.debug(
  'init test user',
  result.messages.map((item) => ({ role: item.type, content: item.content })),
);

const result2 = await agent.invoke(
  {
    messages: [{ role: 'user', content: '我喜欢什么语言' }],
  },
  threadConfig,
);

// 预期读取上下文返回 js
console.debug(
  'test user language query',
  result2.messages.map((item) => ({ role: item.type, content: item.content })),
);

const result3 = await agent.invoke(
  {
    messages: [{ role: 'user', content: '我喜欢什么语言' }],
  },
  { configurable: { thread_id: 'test-user2' } },
);

// 预期丢失上下文
console.debug(
  'test user2 language query',
  result3.messages.map((item) => ({ role: item.type, content: item.content })),
);
