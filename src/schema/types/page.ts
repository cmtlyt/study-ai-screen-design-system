import { z } from 'zod';
import { materialSchema } from './material';

const canvasSchema = z.object({
  width: z.number().min(1),
  height: z.number().min(1),
  backgroundColor: z.string(),
});

export type CanvasSchema = z.infer<typeof canvasSchema>;

const staticDataSourceSchema = z.object({
  type: z.literal('static'),
  id: z.string(),
  name: z.string(),
  data: z.any(),
});

const dataSourceSchema = z.union([
  staticDataSourceSchema,
  z.object({
    ...staticDataSourceSchema.shape,
    type: z.literal('api'),
    url: z.string(),
    data: z.any().optional(),
    interval: z.number().optional(),
    params: z.record(z.string(), z.any()).optional(),
  }),
]);

export type DataSourceSchema = z.infer<typeof dataSourceSchema>;

export const pageSchema = z.object({
  name: z.string().min(1),
  canvas: canvasSchema,
  nodes: z.array(materialSchema),
  dataSource: z.array(dataSourceSchema),
});

export type PageSchema = z.infer<typeof pageSchema>;
