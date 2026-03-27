---
to: src/modules/<%= name %>/schema/<%= name %>.schema.ts
---
export type <%= className %>Schema = {
  name: string;
};

export const <%= name %>Schema = {
  parse: <T>(payload: T) => payload,
};
