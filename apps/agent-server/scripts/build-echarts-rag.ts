import { decodeHTML } from 'entities';
import { randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmbeddingModel } from '../src/ai/model';
import { writeKnowledgeDatabase } from '../src/rag/database';

const ECHARTS_DOCUMENT_DIR = fileURLToPath(new URL('../resources/echarts/', import.meta.url));

function cleanDescription(html: string) {
  return decodeHTML(
    html
      // script、style、iframe 的内部文本不是配置说明，整体删除。
      .replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
      // 替换列表了 div、p 这些标签，当然，咱还得保留换行，要不然纯文本一大坨模型不好读。
      .replace(/<br\s*\/?\s*>|<\/(?:p|div|li|pre|h[1-6])>/gi, '\n')
      // 给列表项补上短横线，使纯文本仍能看出列表结构。
      .replace(/<li\b[^>]*>/gi, '- ')
      // 删除剩余 HTML 标签。
      .replace(/<[^>]*>/g, ''),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

function buildChunks(document: Document, pathPrefix: string) {
  const chunks = [];

  for (const [key, entry] of Object.entries(document)) {
    const description = cleanDescription(entry.desc);
    const path = `${pathPrefix}.${key}`;

    chunks.push({
      id: randomUUID(),
      path,
      description,
    });
  }

  return chunks;
}

const filenames = await readdir(ECHARTS_DOCUMENT_DIR);
const chunks = [];

for (const filename of filenames) {
  const document: Document = JSON.parse(
    await readFile(join(ECHARTS_DOCUMENT_DIR, filename), 'utf-8'),
  );
  const pathPrefix = filename
    .replace(/^option\./, '')
    .replace(/\.json$/, '')
    .replaceAll('-', '.');

  const documentChunks = buildChunks(document, pathPrefix);
  chunks.push(...documentChunks);

  console.debug(`${filename}: ${documentChunks.length} 个知识块`);
}

const embeddings = createEmbeddingModel();

const batchSize = 5;

for (let start = 0; start < chunks.length; start += batchSize) {
  const batch = chunks.slice(start, start + batchSize);
  const texts = batch.map((chunk) => `ECharts 配置 ${chunk.path}\n${chunk.description}`);

  console.debug(`embedding(${start}-${start + batchSize}): running...`);
  const vectors = await embeddings.embedDocuments(texts);
  console.debug(`embedding(${start}-${start + batchSize}): embedding success`);

  writeKnowledgeDatabase(batch, vectors);
  console.debug(`embedding(${start}-${start + batchSize}): save done`);
}
