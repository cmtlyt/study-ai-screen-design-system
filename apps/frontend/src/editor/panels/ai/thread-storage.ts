const THREAD_ID_KEY = '@ai-screen-design-system/frontend:thread-id';

export function getThreadId() {
  return localStorage.getItem(THREAD_ID_KEY);
}

export function setThreadId(id: string) {
  localStorage.setItem(THREAD_ID_KEY, id);
}

export function deleteThreadId() {
  localStorage.removeItem(THREAD_ID_KEY);
}
