import path from 'path';
import { fileURLToPath } from 'url';
import { createAgent } from 'langchain';
import { SqliteSaver } from '@langchain/langgraph-checkpoint-sqlite';
import { createModelOnly } from './utils/create-model';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const checkpointer = SqliteSaver.fromConnString(
  path.join(__dirname, 'data.local/08-sqlite-memory.sqlite'),
);

const chatModel = createModelOnly();

const agent = createAgent({
  model: chatModel,
  checkpointer,
});

const result = await agent.invoke(
  { messages: [{ role: 'user', content: '我叫源悟, 我喜欢 JS' }] },
  // { messages: [{ role: 'user', content: '我喜欢什么语言' }] },
  { configurable: { thread_id: 'test-user' } },
);

console.debug(result.messages.map((item) => ({ role: item.type, content: item.content })));
