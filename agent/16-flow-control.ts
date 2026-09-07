import { z } from 'zod';
import { createGraph } from './utils/create-graph';
import { graphToImage } from './utils/graph-to-image';

const graph = createGraph(
  {
    price: z.number(),
    approved: z.boolean(),
    result: z.string(),
  },
  {
    reviewRequest(state) {
      return { approved: state.price <= 500 };
    },
    placeOrder(state) {
      return { result: `申请通过, 使用 ${state.price} 元下单` };
    },
    rejectRequest(state) {
      return { result: `申请未通过, ${state.price} 太贵了` };
    },
  },
  {
    chooseNext(state) {
      return state.approved ? 'placeOrder' : 'rejectRequest';
    },
  },
  (initBuilder, { edgeMap }) => {
    const builder = initBuilder('reviewRequest', ['placeOrder', 'rejectRequest']);
    builder.addConditionalEdges('reviewRequest', edgeMap.chooseNext, [
      'placeOrder',
      'rejectRequest',
    ]);
  },
);

await graphToImage(graph, 'flow-control');

const successResult = await graph.invoke({ price: 300 });
console.debug('success', successResult);

const failureResult = await graph.invoke({ price: 600 });
console.debug('failure', failureResult);
