export type CourseSchema = {
  name: string;
};

export const courseSchema = {
  parse: <T>(payload: T) => payload,
};
