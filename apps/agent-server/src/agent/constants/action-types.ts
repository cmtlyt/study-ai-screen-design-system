import z from 'zod';

export const ACTION_TYPES = {
  addNode: 'add_node',
  updateNode: 'update_node',
  removeNode: 'remove_node',
  addDataSource: 'add_data_source',
  updateDataSource: 'update_data_source',
} as const;

export const actionTypeSchema = z
  .enum(Object.values(ACTION_TYPES) as (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES][])
  .describe(
    '编辑动作: add_node-新增节点, update_node-更新节点, remove_node-删除节点, add_data_source-新增数据源, update_data_source-更新数据源',
  );
