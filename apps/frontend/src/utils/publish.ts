import { EDITOR_TEMP_ID } from '@/constants/editor';
import type { PageSchema } from '@/schema/types';

const SCREEN_PUBLISH_KEY = 'screen-published';

function getAllScreen() {
  return JSON.parse(localStorage.getItem(SCREEN_PUBLISH_KEY) || '{}');
}

export async function publishScreen(page: PageSchema) {
  const allScreen = getAllScreen();
  let { id } = page;
  if (id === (EDITOR_TEMP_ID as any)) {
    id = crypto.randomUUID();
  }
  allScreen[id] = { ...page, id };
  localStorage.setItem(SCREEN_PUBLISH_KEY, JSON.stringify(allScreen));
  return id;
}

export async function getPublishedScreen(id: string) {
  if (!id) return;
  const allScreen = getAllScreen();
  return allScreen[id];
}
