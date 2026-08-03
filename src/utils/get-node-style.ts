import type { MaterialSchema } from '@/schema/types';

export function getNodeStyle(node: MaterialSchema, index: number) {
  return {
    ...node.style,
    position: 'absolute',
    left: `${node.layout.x}px`,
    top: `${node.layout.y}px`,
    width: `${node.layout.width}px`,
    height: `${node.layout.height}px`,
    zIndex: index + 1,
  };
}
