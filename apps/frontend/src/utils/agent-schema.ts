import type { ZodType } from 'zod';

export function toJSONSchema(schema: ZodType, options?: Parameters<ZodType['toJSONSchema']>[0]) {
  return schema.toJSONSchema({
    override(ctx) {
      const { jsonSchema } = ctx;
      delete jsonSchema.propertyNames;
    },
    ...options,
  });
}
