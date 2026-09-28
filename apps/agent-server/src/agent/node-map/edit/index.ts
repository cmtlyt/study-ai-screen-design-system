import { AIMessage } from '@langchain/core/messages';
import { defineNode } from '../../define';
import { State } from '../../state';
import { ACTION_TYPES } from '../../constants/action-types';
import { generateNode, updateNode } from './node';
import { generateDataSoruce, updateDataSource } from '../data-source';

export const editTaskHandler = defineNode(async (state) => {
  const { editPlan: plans } = state;
  const actions: State['actions'] = [];

  for (const plan of plans || []) {
    const { type, id, action, prompt } = plan;
    const schema = state.schema.material.find((item) => item.type === type);

    if (action === ACTION_TYPES.addNode) {
      const node = (await generateNode(state, schema, prompt)) || {};
      actions.push({ type: ACTION_TYPES.addNode, data: node });
    }

    if (action === ACTION_TYPES.updateNode) {
      const selectedNode = (state.page.nodes as any[]).find((node) => node.id === id);
      if (!selectedNode) {
        return { messages: [new AIMessage('未找到选中的节点')] };
      }

      const node = (await updateNode(state, selectedNode, schema, prompt)) || {};

      actions.push({ type: ACTION_TYPES.updateNode, data: node });
    }

    if (action === ACTION_TYPES.removeNode) {
      const selectedNode = (state.page.nodes as any[]).find((node) => node.id === id);
      if (!selectedNode) {
        return { messages: [new AIMessage('未找到选中的节点')] };
      }

      actions.push({ type: ACTION_TYPES.removeNode, data: selectedNode });
    }

    if (action === ACTION_TYPES.addDataSource) {
      const dataSource = (await generateDataSoruce(state, prompt)) || {};
      actions.push({ type: ACTION_TYPES.addDataSource, data: dataSource });
    }

    if (action === ACTION_TYPES.updateDataSource) {
      const currentDataSource = (state.page.dataSource as any[]).find((ds) => ds.id === id);
      if (!currentDataSource) {
        return { messages: [new AIMessage('未找到指定数据源')] };
      }
      const dataSource = await updateDataSource(state, currentDataSource, prompt);
      actions.push({ type: ACTION_TYPES.updateDataSource, data: dataSource });
    }
  }

  return {
    actions,
    editPlan: null,
  };
});
