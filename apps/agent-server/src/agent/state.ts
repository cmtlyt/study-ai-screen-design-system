import { MessagesValue, StateSchema } from '@langchain/langgraph';
import z from 'zod';
import { classifycationSchema } from './node-map/classifycation';

export const state = new StateSchema({
  messages: MessagesValue,
  page: z.record(z.string(), z.json()),
  selectedNodeIds: z.array(z.string()),
  schema: z.object({
    material: z.array(z.record(z.string(), z.json())),
    canvas: z.record(z.string(), z.json()),
  }),
  classifycation: classifycationSchema,
});

export type State = typeof state.State;
