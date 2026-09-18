import type { ZodObject } from 'zod';

export function toJSONSchema(
  schema: ZodObject,
  options?: Parameters<ZodObject['toJSONSchema']>[0],
) {
  return schema.toJSONSchema({
    override(ctx) {
      const { jsonSchema } = ctx;
      delete jsonSchema.propertyNames;
    },
    ...options,
  });
}
