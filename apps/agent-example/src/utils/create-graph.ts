import { END, START, StateGraph, StateSchema } from '@langchain/langgraph';
import type { z } from 'zod';

type State<T> = { [K in keyof T]: z.infer<T[K]> };

function createBuilder<
  T extends Record<string, any>,
  N extends Record<string, StateSchema<T>['Node']> = Record<string, StateSchema<T>['Node']>,
>(schema: T, nodeMap: N, nodeOptionMap: Record<string, any>) {
  const state = new StateSchema(schema);
  const builder = new StateGraph({ state });
  Object.entries(nodeMap).forEach(([key, node]) => {
    // @ts-expect-error ignore
    builder.addNode(key, node, nodeOptionMap[key as keyof N]);
  });
  return builder as ReturnType<typeof builder.addNode<keyof N & string>>;
}

export function createGraph<
  T extends Record<string, any>,
  S extends State<T> = State<T>,
  N extends Record<string, StateSchema<T>['Node']> = Record<string, StateSchema<T>['Node']>,
  K extends keyof N & string = keyof N & string,
  E extends Record<string, (state: S) => K> = Record<string, (state: S) => K>,
  B extends ReturnType<typeof createBuilder<T, N>> = ReturnType<typeof createBuilder<T, N>>,
>(
  config: {
    state: T;
    nodeMap: N;
    edgeMap?: E;
    options?: Partial<{
      compile: Parameters<B['compile']>;
      node: Record<keyof N, any>;
    }>;
  },
  structGenerater: (
    initBuilder: (
      start?: K | (string & {}),
      end?: (K | (string & {})) | (K | (string & {}))[],
    ) => B,
    ctx: {
      nodeMap: N;
      edgeMap: NonNullable<(typeof config)['edgeMap']> extends Record<infer EK, any>
        ? string extends EK
          ? Record<never, any>
          : NonNullable<(typeof config)['edgeMap']>
        : Record<never, any>;
    },
  ) => void,
) {
  const { state, nodeMap, edgeMap, options } = config;

  const builder = createBuilder<T, N>(state, nodeMap, options?.node || {}) as B;

  structGenerater(
    (start, end) => {
      if (end) (Array.isArray(end) ? end : [end]).forEach((item) => builder.addEdge(item, END));
      if (start) builder.addEdge(START, start);
      return builder;
    },
    { nodeMap, edgeMap: edgeMap || ({} as any) },
  );

  return Reflect.apply(builder.compile, builder, options?.compile || []);
}
