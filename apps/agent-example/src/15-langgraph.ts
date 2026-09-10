import { START, END, StateGraph, StateSchema } from '@langchain/langgraph';
import { z } from 'zod';
import { writeFile } from 'node:fs/promises';

const schema = {
  input: z.number().default(0),
  value: z.number(),
  result: z.string(),
};

type State = { [K in keyof typeof schema]: z.infer<(typeof schema)[K]> };

const state = new StateSchema(schema);

const nodeMap = {
  node1(state) {
    console.debug('node1');
    return { value: state.input + 1 };
  },
  node2(state) {
    console.debug('node2');
    return { value: state.value * 2 };
  },
  node3(state) {
    console.debug('node3');
    return { result: `最终结果是: ${state.value}` };
  },
} satisfies Record<string, (state: State) => Partial<State>>;

const builder = new StateGraph(state);

builder
  // node
  .addNode('node1', nodeMap.node1)
  .addNode('node2', nodeMap.node2)
  .addNode('node3', nodeMap.node3)
  // edge
  .addEdge(START, 'node1')
  .addEdge('node1', 'node2')
  .addEdge('node2', 'node3')
  .addEdge('node3', END);

const graph = builder.compile();

const drawableGraph = await graph.getGraphAsync();
const image = await drawableGraph.drawMermaidPng();
const imageBuffer = new Uint8Array(await image.arrayBuffer());
await writeFile('temp.local/graph.png', imageBuffer);

const result = await graph.invoke({
  input: 3,
});

console.debug(result);
