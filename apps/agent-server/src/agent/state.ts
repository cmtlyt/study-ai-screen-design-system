import { MessagesValue, StateSchema } from '@langchain/langgraph';

export const StateAnnotation = new StateSchema({
  messages: MessagesValue,
});
