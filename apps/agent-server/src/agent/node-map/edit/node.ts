import { createAgent, HumanMessage, toolStrategy } from 'langchain';
import { createNoStreamModel } from '../../../ai/model';
import { searchEChartsOptions } from '../../../rag/tools';
import { State } from '../../state';

type MaterialSchema = State['schema']['material'][number] | undefined;

export async function generateNode(_state: State, materialSchema: MaterialSchema, prompt: string) {
  if (!materialSchema) return null;

  const schema = structuredClone(materialSchema.schema);
  (schema.properties as any).id.const = crypto.randomUUID();
  (schema.properties as any).type.const = materialSchema.type;

  const agent = createAgent({
    model: createNoStreamModel(),
    tools: [searchEChartsOptions],
    responseFormat: toolStrategy(schema as any) as any,
    systemPrompt: `你是一个 AI 大屏设计器的节点生成助手, 请根据用户要求生成一个完整的 ${materialSchema.name} 节点
必须遵守结构化输出 Schema
对于可选属性, 如果用户没有明确要求可以留空
如果是图标物料, 使用的是 ECharts, props.option 必须使用 ECharts 的配置字段完成
\n修改的是 ECharts 配置字段, 嵌套路径或字段含义可以调用 search_echarts_options 查询 ECharts 官方配置`,
  });

  const result = await agent.invoke({
    messages: [new HumanMessage(prompt)],
  });

  console.debug('updateNode =>', result.structuredResponse);

  return result.structuredResponse;
}

export async function updateNode(
  _state: State,
  selectedNode: any,
  materialSchema: MaterialSchema,
  prompt: string,
) {
  if (!materialSchema) return null;
  const schema = structuredClone(materialSchema.schema);
  (schema.properties as any).id.const = selectedNode.id;
  (schema.properties as any).type.const = selectedNode.type;

  const agent = createAgent({
    model: createNoStreamModel(),
    tools: [searchEChartsOptions],
    responseFormat: toolStrategy(schema as any) as any,
    systemPrompt: `你是一个 AI 大屏设计器的节点修改助手, 当前选中的节点是 ${materialSchema.name}, 请根据用户的需求修改该节点
必须遵守结构化输出 Schema
对于可选属性, 如果用户没有明确要求可以留空
如果是图表物料, 使用的是 ECharts, props.option 必须使用 ECharts 的配置字段完成
\n修改的是 ECharts 配置字段, 嵌套路径或字段含义可以调用 search_echarts_options 查询 ECharts 官方配置
\n规则:
- 只能修改当前节点的 props/layout/style 等属性
- 禁止修改节点的 id/type 等属性`,
  });

  const result = await agent.invoke({
    messages: [
      new HumanMessage(`当前节点的内容:\n\n${JSON.stringify(selectedNode)}`),
      new HumanMessage(prompt),
    ],
  });

  const res = result.structuredResponse;
  res.id = selectedNode.id;
  res.type = selectedNode.type;

  console.debug('updateNode =>', res);

  return res;
}
