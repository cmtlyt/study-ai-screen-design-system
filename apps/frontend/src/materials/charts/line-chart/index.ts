import { defineMaterial } from '@/materials/types';

export const material = defineMaterial({
  name: '折线图',
  icon: 'fluent-color:list-bar-16',
  cagetory: 'chart',
  schema: {
    type: 'line-chart',
    name: '折线图',
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
          text: '访问量趋势',
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
            { month: '周一', visits: 820 },
            { month: '周二', visits: 932 },
            { month: '周三', visits: 901 },
            { month: '周四', visits: 934 },
            { month: '周五', visits: 1290 },
            { month: '周六', visits: 1330 },
            { month: '周日', visits: 1320 },
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
          boundaryGap: false,
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
            name: '访问量',
            type: 'line',
            smooth: true,
            symbolSize: 8,
            encode: {
              x: 'data',
              y: 'visits',
            },
            lineStyle: {
              width: 3,
              color: '#22d3ee',
            },
            itemStyle: {
              color: '#22d3ee',
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
    { key: 'props.option.series.0.encode.x', type: 'input', label: 'x字段' },
    { key: 'props.option.series.0.encode.y', type: 'input', label: 'y字段' },
    { key: 'props.option.grid.top', type: 'number', label: '上边距', span: 12 },
    { key: 'props.option.grid.right', type: 'number', label: '右边距', span: 12 },
    { key: 'props.option.grid.bottom', type: 'number', label: '下边距', span: 12 },
    { key: 'props.option.grid.left', type: 'number', label: '左边距', span: 12 },
  ],
});
