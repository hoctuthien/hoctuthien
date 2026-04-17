export type CourseReviewSchema = {
  name: string;
};

export const courseReviewSchema = {
  // Thêm dấu phẩy sau <T> nếu là file .tsx hoặc viết chuẩn arrow function generic
  parse: <T>(payload: T): T => payload,
};
