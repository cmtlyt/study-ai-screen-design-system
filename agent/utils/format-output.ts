export function formatOutput(res: any) {
  return res.messages.map((item: any) => ({ role: item.type, content: item.content }));
}
