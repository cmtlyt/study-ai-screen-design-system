import { z } from 'zod';

export const materialPositionLayoutSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().min(1),
  height: z.number().min(1),
});

export type MaterialPositionLayoutSchema = z.infer<typeof materialPositionLayoutSchema>;

export const materialLayoutSchema = z.union([materialPositionLayoutSchema]);

export type MaterialLayoutSchema = z.infer<typeof materialLayoutSchema>;

export const materialEvent = z.object({
  type: z.string().describe('事件类型'),
  name: z.string().describe('事件名称'),
  code: z.string().describe('事件代码'),
});

export type MaterialEvent = z.infer<typeof materialEvent>;

export const materialSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  layout: materialLayoutSchema,
  locked: z.boolean(),
  style: z.any().optional(),
  props: z
    .object({
      dataId: z.string().optional(),
    })
    .loose(),
  events: z.array(materialEvent).optional(),
});

export type MaterialSchema = z.infer<typeof materialSchema>;

export type DefineMaterialSchema = Omit<MaterialSchema, 'id' | 'locked'>;
