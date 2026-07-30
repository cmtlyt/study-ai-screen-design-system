import { defineMaterial } from '@/materials/types';

export const material = defineMaterial({
  name: '柱状图',
  icon: 'lets-icons:chart',
  cagetory: 'chart',
  schema: {
    type: 'bar-chart',
    name: '柱状图',
    layout: {
      x: 0,
      y: 0,
      width: 400,
      height: 260,
    },
    props: {
      option: {
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
          text: '销售额统计',
          top: 8,
          left: 'center',
          textStyle: {
            color: '#fff',
            fontSize: 16,
          },
        },
        tooltop: {},
        dataset: {
          source: [
            { month: '1月', sales: 120 },
            { month: '2月', sales: 200 },
            { month: '3月', sales: 150 },
            { month: '4月', sales: 80 },
            { month: '5月', sales: 170 },
            { month: '6月', sales: 240 },
          ],
        },
        grid: {
          top: 86,
          right: 24,
          bottom: 32,
          left: 48,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#64748b',
            },
          },
          axisLabel: {
            color: '#cbd5e1',
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#cbd5e1',
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(148,163,184,0.18)',
            },
          },
        },
        series: [
          {
            name: '销售额',
            type: 'bar',
            barWidth: '45%',
            encode: {
              x: 'month',
              y: 'sales',
            },
            itemStyle: {
              color: '#22d3ee',
              borderRadius: [4, 4, 0, 0],
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
    { key: 'props.option.series.0.itemStyle.color', type: 'color', label: '柱颜色' },
    { key: 'props.option.series.0.encode.x', type: 'input', label: 'x字段' },
    { key: 'props.option.series.0.encode.y', type: 'input', label: 'y字段' },
    { key: 'props.option.grid.top', type: 'number', label: '上边距', span: 12 },
    { key: 'props.option.grid.right', type: 'number', label: '右边距', span: 12 },
    { key: 'props.option.grid.bottom', type: 'number', label: '下边距', span: 12 },
    { key: 'props.option.grid.left', type: 'number', label: '左边距', span: 12 },
  ],
});
