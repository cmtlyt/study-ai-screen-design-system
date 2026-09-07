import { END, START, StateGraph, StateSchema } from '@langchain/langgraph';
import type { z } from 'zod';

type State<T> = { [K in keyof T]: z.infer<T[K]> };

function createBuilder<
  T extends Record<string, any>,
  N extends Record<string, StateSchema<T>['Node']> = Record<string, StateSchema<T>['Node']>,
>(schema: T, nodeMap: N) {
  const state = new StateSchema(schema);
  return new StateGraph({ state }).addNode<keyof N & string, N>(nodeMap as any);
}

export function createGraph<
  T extends Record<string, any>,
  S extends State<T> = State<T>,
  N extends Record<string, StateSchema<T>['Node']> = Record<string, StateSchema<T>['Node']>,
  K extends keyof N & string = keyof N & string,
  E extends Record<string, (state: S) => K> = Record<string, (state: S) => K>,
>(
  schema: T,
  nodeMap: N,
  edgeMap: E,
  structGenerater: <
    B extends ReturnType<typeof createBuilder<T, N>> = ReturnType<typeof createBuilder<T, N>>,
  >(
    initBuilder: (start: K, end: K | K[]) => B,
    ctx: { nodeMap: N; edgeMap: E },
  ) => void,
) {
  const builder = createBuilder<T, N>(schema, nodeMap);

  structGenerater(
    (start, end) => {
      (Array.isArray(end) ? end : [end]).forEach((item) => builder.addEdge(item, END));
      return builder.addEdge(START, start);
    },
    { nodeMap, edgeMap },
  );

  return builder.compile();
}
