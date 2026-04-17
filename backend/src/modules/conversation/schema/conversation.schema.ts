export type ConversationSchema = {
  name: string;
};

export const conversationSchema = {
  parse: <T>(payload: T) => payload,
};
