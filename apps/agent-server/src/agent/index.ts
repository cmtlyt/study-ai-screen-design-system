import { END, START, StateGraph } from '@langchain/langgraph';
import { config } from 'dotenv';
import { state } from './state';
import { NodeMap, NODE_MAP } from './node-map';

config({
  path: ['.env', '.env.local'],
  override: true,
});

const builder = new StateGraph(state)
  .addNode<keyof NodeMap, NodeMap>(NODE_MAP)
  .addEdge(START, 'classifyTaskHandler')
  .addConditionalEdges('classifyTaskHandler', (state) => state.classifycation.task, {
    page: 'pageTaskHandler',
    ask: 'askTaskHandler',
    edit: 'editTaskHandler',
  })
  .addEdge('askTaskHandler', END)
  .addEdge('editTaskHandler', END)
  .addEdge('pageTaskHandler', END);

export const graph = builder.compile();

export type AgentInputState = Parameters<typeof graph.invoke>[0];

graph.name = 'ScreenDesignAgent';
