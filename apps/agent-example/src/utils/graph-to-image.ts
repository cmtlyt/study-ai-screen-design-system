import { writeFile } from 'node:fs/promises';

export async function graphToImage(
  graph: { getGraphAsync: () => Promise<{ drawMermaidPng: () => Promise<Blob> }> },
  name: string,
) {
  return graph
    .getGraphAsync()
    .then((drawableGraph) => drawableGraph.drawMermaidPng())
    .then((image) => image.arrayBuffer())
    .then((buffer) => writeFile(`temp.local/${name}.png`, new Uint8Array(buffer)));
}
