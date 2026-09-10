import { MessagesValue, StateSchema } from '@langchain/langgraph';

export const state = new StateSchema({
  messages: MessagesValue,
});
