import { jsonObjSchema, materialSchema } from '@/schema/types';
import z from 'zod';

const positionSchema = z
  .union([z.number(), z.enum(['left', 'center', 'right'])])
  .describe('标题位置');

const chartTitleSchema = z
  .object({
    text: z.string().describe('标题'),
    top: z.union([z.number(), z.string()]).optional().describe('标题距离顶部的位置'),
    left: positionSchema.optional().describe('标题水平位置'),
    textStyle: jsonObjSchema.optional(),
  })
  .describe('EChart 标题配置');

const chartLegendSchema = z
  .object({
    top: z.union([z.number(), z.string()]).optional().describe('图例距离顶部的位置'),
    left: positionSchema.optional().describe('图例水平位置'),
    itemWidth: z.number().describe('图例标记宽度'),
    itemHeight: z.number().describe('图例标记高度'),
    show: z.boolean().describe('是否显示图例'),
    textStyle: jsonObjSchema.optional().describe('图例文本样式'),
  })
  .partial()
  .describe('EChart 图例配置');

const chartDatasetSchema = z
  .object({
    source: z.array(jsonObjSchema).describe('EChart dataset 的行数据, 每个对象代表一条数据'),
  })
  .describe('EChart dataset 配置');

const chartGridSchema = z
  .object({
    top: z.number().describe('绘图区上边距'),
    left: z.number().describe('绘图区左边距'),
    right: z.number().describe('绘图区右边距'),
    bottom: z.number().describe('绘图区下边距'),
    containLabel: z.boolean().describe('绘图区是否包含坐标轴标签'),
  })
  .partial()
  .describe('直角坐标系绘图区配置');

const chartOptionSchema = z
  .object({
    color: z.array(z.string()).optional().describe('EChart 颜色'),
    title: chartTitleSchema,
    legend: chartLegendSchema.optional(),
    tooltip: jsonObjSchema.optional().describe('EChart 提示框配置'),
    dataset: chartDatasetSchema.optional(),
    grid: chartGridSchema.optional(),
    xAxis: jsonObjSchema.optional().describe('直角坐标系 x 轴配置'),
    yAxis: jsonObjSchema.optional().describe('直角坐标系 y 轴配置'),
    series: z.array(jsonObjSchema).min(1).describe('EChart 系列配置, 包含真实 type/encode 和样式'),
  })
  .describe('EChart 配置');

export const configSchema = materialSchema.extend({
  props: z.object({
    option: chartOptionSchema,
  }),
});
