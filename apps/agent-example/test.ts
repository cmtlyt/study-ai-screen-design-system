import z from 'zod';

z.fromJSONSchema({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    id: { type: 'string' },
    type: { type: 'string', const: 'text' },
    name: { type: 'string' },
    layout: {
      anyOf: [
        {
          type: 'object',
          properties: {
            x: { type: 'number', minimum: 0 },
            y: { type: 'number', minimum: 0 },
            width: { type: 'number', minimum: 1 },
            height: { type: 'number', minimum: 1 },
          },
          required: ['x', 'y', 'width', 'height'],
          additionalProperties: false,
        },
      ],
    },
    locked: { default: false, type: 'boolean' },
    style: {
      type: 'object',
      propertyNames: { type: 'string' },
      additionalProperties: { type: 'string' },
    },
    props: {
      type: 'object',
      properties: { content: { type: 'string' } },
      required: ['content'],
      additionalProperties: false,
    },
    events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', description: '事件类型' },
          name: { type: 'string', description: '事件名称' },
          desc: { type: 'string', description: '事件描述' },
          code: { type: 'string', description: '事件代码' },
          handler: {},
        },
        required: ['type', 'name', 'code'],
        additionalProperties: false,
      },
    },
  },
  required: ['id', 'type', 'name', 'layout', 'locked', 'props'],
  additionalProperties: false,
}).extend({
  id: z.literal(crypto.randomUUID()),
});
