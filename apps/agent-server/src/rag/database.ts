import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import { fileURLToPath } from 'node:url';

export const RAG_DB_PATH = fileURLToPath(new URL('../../data/rag.sqlite', import.meta.url));

export function writeKnowledgeDatabase(chunks: Record<string, string>[], vectors: number[][]) {
  if (chunks.length === 0 || vectors.length === 0 || chunks.length !== vectors.length) {
    throw new Error('chunks 和 vectors 长度不一致或者为空');
  }
  // 使用第一条向量确定维度
  const dimensions = vectors[0].length;
  const db = new Database(RAG_DB_PATH);
  try {
    sqliteVec.load(db);

    // 【改动重点】IF NOT EXISTS，重复调用不会重复建表
    db.exec(`
      CREATE TABLE IF NOT EXISTS chunks (
        rowid INTEGER PRIMARY KEY,
        chunk_id TEXT NOT NULL UNIQUE,
        path TEXT NOT NULL,
        description TEXT NOT NULL
      );
      CREATE VIRTUAL TABLE IF NOT EXISTS chunk_vectors USING vec0(
        embedding float[${dimensions}] distance_metric=cosine
      );
    `);

    // 事务包裹，批量插入，性能更好
    db.transaction(() => {
      const insertChunk = db.prepare(`
        INSERT INTO chunks(chunk_id, path, description)
        VALUES (?, ?, ?)
      `);
      const insertVector = db.prepare('INSERT INTO chunk_vectors(rowid, embedding) VALUES (?, ?)');

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const vec = vectors[i];
        // 插入chunk，拿到rowid
        const result = insertChunk.run(chunk.id, chunk.path, chunk.description);
        // sqlite-vec 绑定Float32Array
        insertVector.run(BigInt(result.lastInsertRowid), new Float32Array(vec));
      }
    })();
  } finally {
    db.close();
  }
}

export function searchKnowledgeDatabase(vector: number[], topK: number) {
  // 以只读方式打开已经生成好的 SQLite 知识库。
  const db = new Database(RAG_DB_PATH, {
    readonly: true,
  });

  try {
    // 当前连接需要加载 sqlite-vec，才能执行 vec0 的向量查询。
    sqliteVec.load(db);

    return db
      .prepare(
        `
          SELECT c.chunk_id AS id, c.path, c.description,
            v.distance
          FROM chunk_vectors v
          JOIN chunks c ON c.rowid = v.rowid
          WHERE v.embedding MATCH ? AND k = ?
          ORDER BY v.distance
        `,
      )
      .all(new Float32Array(vector), topK);
  } finally {
    db.close();
  }
}
