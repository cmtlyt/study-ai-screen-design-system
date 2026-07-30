export interface MaterialPositionLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type MaterialLayout = MaterialPositionLayout;

export interface MaterialSchema {
  id: string;
  type: string;
  name: string;
  layout: MaterialLayout;
  locked: boolean;
  style?: Partial<CSSStyleDeclaration>;
  props: Record<string, any>;
}

export type DefineMaterialSchema = Omit<MaterialSchema, 'id' | 'locked'>;
