import { defineMaterial, type InstallCtx } from '../types';
import TextMaterial from './component.vue';

const textMaterial = defineMaterial({
  name: '文本',
  icon: 'icon-park-outline:text',
  cagetory: 'info',
  schema: {
    type: 'text',
    name: '文本',
    layout: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    },
    style: {
      color: '#000',
      fontSize: '16px',
    },
    props: {
      content: '文本',
    },
    events: [
      //
      {
        type: 'click',
        name: 'fn',
        code: `function main($context, $node, event) {\n  $context.refreshNodesByDataId('789');\n}`,
      },
    ],
  },
  setters: [
    {
      key: 'style.color',
      label: '颜色',
      type: 'color',
      span: 8,
    },
    {
      key: 'style.fontSize',
      label: '字体大小',
      type: 'number',
      span: 16,
      props: {
        min: 1,
      },
      'x-parser': {
        encoder: (value: string) => (value ? parseInt(value, 10) : 1),
        decoder: (value: number) => (value ? `${value}px` : '1px'),
      },
    },
    {
      key: 'props.content',
      label: '内容',
      type: 'input',
    },
  ],
});

export function install(ctx: InstallCtx) {
  ctx.register(textMaterial, TextMaterial);
}
