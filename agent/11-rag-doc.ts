import fs from 'node:fs/promises';
import { Document } from 'langchain';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { env } from 'node:process';
import { config } from 'dotenv';
import { createModelOnly } from './utils/create-model';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

config({
  path: ['.env', '.env.local'],
  override: true,
});

function normalizeMDPlainText(text: string) {
  return text
    .replace(/\r\n?/gu, '\n')
    .replace(/[ \t]+/gu, ' ')
    .replace(/\n{3,}/gu, '\n\n')
    .trim();
}

async function loadMarkdownDocs(filePath: string) {
  const markdown = await fs.readFile(filePath, 'utf8');

  return [
    new Document({
      pageContent: normalizeMDPlainText(markdown),
      metadata: {
        source: filePath,
      },
    }),
  ];
}

const mdRawDocs = await loadMarkdownDocs('./README.md');

const mdSplitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
  chunkSize: 500,
});

const mdChunks = await mdSplitter.splitDocuments(mdRawDocs);

function normalizePDFPlainText(text: string) {
  return text
    .replace(/\r\n?/gu, '\n')
    .replace(/[ \t]+/gu, ' ')
    .replace(/PDF 解析示例/gu, '')
    .replace(/^[ \t]*第[ \t]*\d+[ \t]*页[ \t]*$/gmu, '')
    .replace(/\n{3,}/gu, '\n\n')
    .trim();
}

async function loadPDFDocs(filePath: string) {
  const data = await fs.readFile(filePath);
  const parse = new PDFParse({ data });

  try {
    const result = await parse.getText();

    return result.pages.map((page) => {
      return new Document({
        pageContent: normalizePDFPlainText(page.text),
        metadata: {
          source: filePath,
          page: page.num,
        },
      });
    });
  } finally {
    await parse.destroy();
  }
}

const pdfRawDocs = await loadPDFDocs('./pdf-parse.pdf');

const pdfSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 80,
});

const pdfChunks = await pdfSplitter.splitDocuments(pdfRawDocs);

function normalizeWordPlainText(text: string) {
  return text
    .replace(/\r\n?/gu, '\n')
    .replace(/[ \t]+/gu, ' ')
    .replace(/\n{3,}/gu, '\n\n')
    .trim();
}

async function loadWordDocs(filePath: string) {
  const result = await mammoth.extractRawText({ path: filePath });
  return [
    new Document({
      pageContent: normalizeWordPlainText(result.value),
      metadata: {
        source: filePath,
      },
    }),
  ];
}

const wordRawDocs = await loadWordDocs('./pdf-parse.docx');

const wordSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 80,
});

const wordChunks = await wordSplitter.splitDocuments(wordRawDocs);

export const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-large',
  batchSize: 10,
  apiKey: env.AI_API_KEY,
  dimensions: 1024,
  configuration: {
    baseURL: env.AI_BASE_URL,
  },
});

const vectorStore = await MemoryVectorStore.fromDocuments(
  [...mdChunks, ...pdfChunks, ...wordChunks],
  embeddings,
);

const question = '怎么启动这个项目的开发服务器';

const matchedDocs = await vectorStore.similaritySearchWithScore(question, 5);

const context = matchedDocs
  .map(([doc, score], index) => `资料${index + 1}(score: ${score}): ${doc.pageContent}`)
  .join('\n---\n');

const model = createModelOnly();

const result = await model.invoke([
  { role: 'user', content: `检索到的资料: ${context}\n---\n用户问题: ${question}` },
]);

console.debug('result', result.content);
