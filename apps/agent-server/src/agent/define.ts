import type { NodeMap } from './node-map';
import type { State, state } from './state';

export function defineNode<T extends typeof state.Node>(handler: T) {
  return handler;
}

type NodeKeys = keyof NodeMap;

export type EdgeHandler = (state: State) => NodeKeys | Promise<NodeKeys>;

export function defineEdge(handler: EdgeHandler) {
  return handler;
}
