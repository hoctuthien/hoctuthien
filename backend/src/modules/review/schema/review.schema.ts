export type ReviewSchema = {
  name: string;
};

export const reviewSchema = {
  parse: <T>(payload: T) => payload,
};
