import type { ZodType } from 'zod';

/**
 * 将 Zod Schema 转为浏览器端可用的 .d.ts 字符串
 * 纯同步、零依赖、专为 Monaco extraLibs 设计
 */
export function schemaToInterface(schema: ZodType, name: string): string {
  const jsonSchema = schema.toJSONSchema({ unrepresentable: 'any' });
  const body = serializeJsonSchema(jsonSchema);

  // 使用 declare type 而非 interface，避免 JSON Schema 中复杂 $ref 展开问题
  return `interface ${name} ${body}`;
}

function serializeJsonSchema(schema: Record<string, any>): string {
  // 处理组合类型
  if (schema.anyOf) {
    return schema.anyOf.map(serializeJsonSchema).join(' | ');
  }
  if (schema.allOf) {
    return schema.allOf.map(serializeJsonSchema).join(' & ');
  }

  // 处理字面量与枚举
  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (schema.enum) return schema.enum.map((v: any) => JSON.stringify(v)).join(' | ');

  // 处理基础类型
  switch (schema.type) {
    case 'string':
      return 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';

    case 'array':
      const itemType = schema.items ? serializeJsonSchema(schema.items) : 'any';
      return `${itemType}[]`;

    case 'object': {
      const props = schema.properties || {};
      const required = new Set(schema.required || []);

      const entries = Object.entries(props).map(([key, value]) => {
        const isOpt = !required.has(key);
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
        return `  ${safeKey}${isOpt ? '?' : ''}: ${serializeJsonSchema(value as Record<string, any>)};`;
      });

      // 处理 additionalProperties
      let indexSig = '';
      if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        indexSig = `\n  [k: string]: ${serializeJsonSchema(schema.additionalProperties)};`;
      }

      return `{\n${entries.join('\n')}${indexSig}\n}`;
    }

    default:
      return 'any';
  }
}
