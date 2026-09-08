import { z } from 'zod';
import { createGraph } from './utils/create-graph';
import { graphToImage } from './utils/graph-to-image';

const identityCheckGraph = createGraph(
  {
    state: {
      questName: z.string(),
      status: z.string(),
    },
    nodeMap: {
      checkIdCard(state) {
        return {
          status: `${state.status} -> 身份原件已检查`,
        };
      },
      verifyIdentity(state) {
        return {
          status: `${state.status} -> 身份信息核验通过`,
        };
      },
    },
  },
  (init) => {
    const builder = init('checkIdCard', ['verifyIdentity']);
    builder.addEdge('checkIdCard', 'verifyIdentity');
  },
);

let attempts = 0;

const hotelCheckInGraph = createGraph(
  {
    state: {
      questName: z.string(),
      status: z.string(),
    },
    nodeMap: {
      prepareCheckIn(state) {
        if (!attempts++) {
          throw new Error('系统繁忙');
        }
        return {
          status: `${state.questName} 准备入住`,
        };
      },
    },
    options: {
      node: {
        prepareCheckIn: {
          retryPolicy: {
            maxAttempts: 2,
          },
        },
      },
    },
  },
  (init) => {
    const builder = init('prepareCheckIn', 'checkIdentity');
    builder.addNode('checkIdentity', identityCheckGraph).addEdge('prepareCheckIn', 'checkIdentity');
  },
);

await graphToImage(hotelCheckInGraph, 'sub-graph-and-retry');

const result = await hotelCheckInGraph.invoke({
  questName: '章三',
});

console.log(result);
