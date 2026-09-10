import { END, START, StateGraph } from '@langchain/langgraph';
import { config } from 'dotenv';
import { state } from './state';
import { createModelOnly } from '../ai/model';

config({
  path: ['.env', '.env.local'],
  override: true,
});

const nodeMap = {
  async answerMessage(state) {
    console.log('Current state:', state);
    const model = createModelOnly();
    const result = await model.invoke(state.messages);
    return {
      messages: [result],
    };
  },
} satisfies Record<string, typeof state.Node>;

const builder = new StateGraph(state)
  .addNode<keyof typeof nodeMap, typeof nodeMap>(nodeMap)
  .addEdge(START, 'answerMessage')
  .addEdge('answerMessage', END);

export const graph = builder.compile();

export type AgentInputState = Parameters<typeof graph.invoke>[0];

graph.name = 'ScreenDesignAgent';
