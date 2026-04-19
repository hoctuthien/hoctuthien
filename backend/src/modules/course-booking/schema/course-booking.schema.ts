export type CourseBookingSchema = {
  name: string;
};

export const courseBookingSchema = {
  parse: <T,>(payload: T) => payload,
};
