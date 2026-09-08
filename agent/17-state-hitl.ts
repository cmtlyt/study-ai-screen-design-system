import { z } from 'zod';
import { Command, interrupt, MemorySaver } from '@langchain/langgraph';
import { createGraph } from './utils/create-graph';
import { graphToImage } from './utils/graph-to-image';
import { confirm } from '@inquirer/prompts';

const graph = createGraph(
  {
    state: {
      price: z.number(),
      approved: z.boolean(),
      result: z.string(),
    },
    nodeMap: {
      requestApproval(state) {
        const decision = interrupt({
          question: `申请 ${state.price} 元`,
          price: state.price,
        });

        return {
          result: decision.approved ? '申请通过' : '申请未通过',
        };
      },
    },
    options: {
      compile: [{ checkpointer: new MemorySaver() }],
    },
  },
  (init) => {
    init('requestApproval', 'requestApproval');
  },
);

await graphToImage(graph, 'state-hitl');

const thread = {
  configurable: {
    thread_id: 'test',
  },
};

const pausedResult = await graph.invoke({ price: 399 }, thread);
console.debug('pausedResult', pausedResult);

const approved = await confirm({
  // @ts-expect-error test
  message: pausedResult.__interrupt__[0].value.question,
  default: false,
});

const finalResult = await graph.invoke(
  new Command({
    resume: {
      approved,
    },
  }),
  thread,
);

console.debug('finalResult', finalResult);
