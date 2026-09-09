import { defineMaterial } from '@/materials/types';

export const material = defineMaterial({
  name: '饼图',
  icon: 'fluent-color:list-bar-16',
  cagetory: 'chart',
  schema: {
    type: 'pie-chart',
    name: '饼图',
    layout: {
      x: 0,
      y: 0,
      width: 400,
      height: 260,
    },
    props: {
      option: {
        color: ['#22d3ee', '#a78bfa', '#f59e0b', '#34d399', '#fb7185'],
        legend: {
          top: 38,
          left: 'center',
          itemWidth: 12,
          itemHeight: 8,
          show: true,
          textStyle: {
            color: '#cbd5e1',
          },
        },
        title: {
          text: '访问来源占比',
          top: 8,
          left: 'center',
          textStyle: {
            color: '#fff',
            fontSize: 16,
          },
        },
        tooltop: {
          trigger: 'item',
        },
        dataset: {
          source: [
            { channel: '搜索引擎', value: 1048 },
            { channel: '直接访问', value: 735 },
            { channel: '联盟广告', value: 484 },
            { channel: '视频广告', value: 300 },
          ],
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            center: ['50%', '62%'],
            avoidLabelOverlap: true,
            label: {
              color: '#e2e8f0',
            },
            labelLine: {
              lineStyle: {
                color: '#94a3b8',
              },
            },
            encode: {
              itemName: 'channel',
              value: 'value',
            },
          },
        ],
      },
    },
  },
  setters: [
    { key: 'props.option.title.text', type: 'input', label: '标题' },
    { key: 'props.option.title.textStyle.color', type: 'color', label: '标题颜色' },
    { key: 'props.option.legend.show', type: 'checkbox', label: '图例' },
    {
      key: 'props.option.title.left',
      type: 'select',
      label: '标题位置',
      props: {
        options: [
          { label: '居中', value: 'center' },
          { label: '左', value: 'left' },
          { label: '右', value: 'right' },
        ],
      },
    },
    { key: 'props.option.color.0', type: 'color', label: '主色' },
    { key: 'props.option.series.0.encode.itemName', type: 'input', label: '名称字段' },
    { key: 'props.option.series.0.encode.value', type: 'input', label: '数值字段' },
  ],
});
