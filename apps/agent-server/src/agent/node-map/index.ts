import { state } from '../state';
import { answerMessage } from './answer-message';

export const NODE_MAP = {
  answerMessage,
} satisfies Record<string, typeof state.Node>;

export type NodeMap = typeof NODE_MAP;
