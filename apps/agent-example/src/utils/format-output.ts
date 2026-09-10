export function formatOutput(res: { messages: Array<{ type: any; content: any }> }) {
  return res.messages.map((item: any) => ({ role: item.type, content: item.content }));
}
