async function main(api) {
  const context = api.getCurrContext();
  console.debug(context);

  const newContext = await api.patchContext((draft) => {
    draft.a = 1;
    draft.b = { num: 3 };
    draft.b.num++;
    draft.c.push(5);
  });

  const hostContext = await api.getHostCurrContext();

  console.debug('new', newContext, 'host', hostContext);

  const newContextCSum = await api.exec('sum', ...newContext.c);

  return {
    old: context.a + context.b.num + context.c.at(-1),
    new: newContext.a + newContext.b.num + newContext.c.at(-1),
    newContextCSum,
  };
}
