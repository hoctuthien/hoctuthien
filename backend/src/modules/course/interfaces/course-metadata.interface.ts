export interface CourseTimeMetadata {
  monday?: string[]; // e.g. ["09:00-11:00"]
  tuesday?: string[];
  wednesday?: string[];
  thursday?: string[];
  friday?: string[];
  saturday?: string[];
  sunday?: string[];
}

export interface CourseMetadata {
  time?: CourseTimeMetadata;
  [key: string]: any;
}
