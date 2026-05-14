import { components } from "@/core/types/api.generated";

// Định nghĩa kiểu dữ liệu dựa trên Swagger gen
// Lưu ý: Tùy vào cấu trúc api.generated.ts, chúng ta lấy từ schemas hoặc operations
export type MentorAvailabilityStatus = "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface AdminMentorApplication {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  jobTitle: string;
  company: string;
  yearsOfExperience: number;
  status: MentorAvailabilityStatus;
  createdAt: string;
  selected?: boolean;
}
