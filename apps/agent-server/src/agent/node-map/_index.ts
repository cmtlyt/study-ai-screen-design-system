import { state } from '../state';
import { askTaskHandler } from './ask';
import { classifyTaskHandler } from './classifycation';
import { editTaskHandler } from './edit';
import { editResultHandler } from './edit-result';
import { pageTaskHandler } from './page';

export const NODE_MAP = {
  askTaskHandler,
  pageTaskHandler,
  editTaskHandler,
  classifyTaskHandler,
  editResultHandler,
} satisfies Record<string, typeof state.Node>;

export type NodeMap = typeof NODE_MAP;
