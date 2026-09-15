import { state } from '../state';
import { askTaskHandler } from './ask';
import { classifyTaskHandler } from './classifycation';
import { editTaskHandler } from './edit';
import { editResultHandler } from './edit-result';
import { pageTaskHandler } from './page';
import { editPlanTaskHandler } from './edit-plan';

export const NODE_MAP = {
  askTaskHandler,
  pageTaskHandler,
  editTaskHandler,
  classifyTaskHandler,
  editResultHandler,
  editPlanTaskHandler,
} satisfies Record<string, typeof state.Node>;

export type NodeMap = typeof NODE_MAP;
