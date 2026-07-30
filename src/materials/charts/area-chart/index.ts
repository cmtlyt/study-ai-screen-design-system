import { defineMaterial } from '@/materials/types';

export const material = defineMaterial({
  name: '面积图',
  icon: 'fluent-color:list-bar-16',
  cagetory: 'chart',
  schema: {
    type: 'area-chart',
    name: '面积图',
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
          text: '成交额趋势',
          top: 8,
          left: 'center',
          textStyle: {
            color: '#fff',
            fontSize: 16,
          },
        },
        tooltop: {
          trigger: 'axis',
        },
        dataset: {
          source: [
            { month: '周一', revenue: 120 },
            { month: '周二', revenue: 200 },
            { month: '周三', revenue: 150 },
            { month: '周四', revenue: 260 },
            { month: '周五', revenue: 330 },
            { month: '周六', revenue: 420 },
            { month: '周日', revenue: 510 },
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
            name: '成交额',
            type: 'line',
            smooth: true,
            symbolSize: 8,
            encode: {
              x: 'data',
              y: 'revenue',
            },
            lineStyle: {
              width: 3,
              color: '#22d3ee',
            },
            itemStyle: {
              color: '#22d3ee',
            },
            areaStyle: {
              color: 'rgba(34,211,238,0.25)',
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
    { key: 'props.option.series.0.itemStyle.color', type: 'color', label: '线颜色' },
    { key: 'props.option.series.0.areaStyle.color', type: 'color', label: '面积颜色' },
    { key: 'props.option.series.0.encode.x', type: 'input', label: 'x字段' },
    { key: 'props.option.series.0.encode.y', type: 'input', label: 'y字段' },
    { key: 'props.option.grid.top', type: 'number', label: '上边距', span: 12 },
    { key: 'props.option.grid.right', type: 'number', label: '右边距', span: 12 },
    { key: 'props.option.grid.bottom', type: 'number', label: '下边距', span: 12 },
    { key: 'props.option.grid.left', type: 'number', label: '左边距', span: 12 },
  ],
});
