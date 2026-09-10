import { fileURLToPath } from 'node:url';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { createAgent } from 'langchain';
import { createModelOnly } from './utils/create-model';

const mcpServerPath = fileURLToPath(new URL('../mcp.local/stdio-server.ts', import.meta.url));

const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    weatherStdio: {
      transport: 'stdio',
      command: 'tsx',
      args: [mcpServerPath],
    },
    weatherHttp: {
      transport: 'http',
      url: 'http://127.0.0.1:3000/mcp',
    },
  },
});

const tools = await mcpClient.getTools();

console.debug('发现的 mcp tools', tools);

const _ = createAgent({
  model: createModelOnly(),
  tools,
});
