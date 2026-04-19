export type CourseReviewSchema = {
  name: string;
};

export const courseReviewSchema = {
  parse: <T,>(payload: T) => payload,
};
