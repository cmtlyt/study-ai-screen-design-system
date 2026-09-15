import { MessagesValue, StateSchema } from '@langchain/langgraph';
import z from 'zod';
import { classifycationSchema } from './node-map/classifycation';
import { planEditSchema, actionTypeSchema } from './node-map/edit-plan';

export const state = new StateSchema({
  messages: MessagesValue,
  page: z.record(z.string(), z.json()),
  selectedNodeIds: z.array(z.string()),
  schema: z.object({
    material: z.array(
      z.object({
        type: z.string(),
        name: z.string(),
        schema: z.record(z.string(), z.json()),
      }),
    ),
    canvas: z.record(z.string(), z.json()),
  }),
  classifycation: classifycationSchema,
  actions: z
    .array(
      z.looseObject({
        type: actionTypeSchema,
        node: z.record(z.string(), z.json()).nullable(),
      }),
    )
    .nullable(),
  editPlan: z.array(planEditSchema).nullable(),
});

export type State = typeof state.State;
