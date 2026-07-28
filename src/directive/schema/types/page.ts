import type { MaterialSchema } from './material';

export interface CanvasSchema {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface PageSchema {
  canvas: CanvasSchema;
  nodes: MaterialSchema[];
}
