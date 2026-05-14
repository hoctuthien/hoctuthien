import { AdminMentorApplication } from "./mentor-management.types";

export const MOCK_MENTOR_APPLICATIONS: AdminMentorApplication[] = [
  {
    id: "1",
    user: {
      id: "u1",
      name: "Nguyễn Văn A",
      email: "vana@gmail.com",
      avatarUrl: null,
    },
    jobTitle: "Senior Frontend Engineer",
    company: "Google",
    yearsOfExperience: 8,
    status: "PENDING",
    createdAt: "2024-05-12T08:00:00Z",
  },
  {
    id: "2",
    user: {
      id: "u2",
      name: "Trần Thị B",
      email: "thib@meta.com",
      avatarUrl: null,
    },
    jobTitle: "Product Manager",
    company: "Meta",
    yearsOfExperience: 5,
    status: "APPROVED",
    createdAt: "2024-05-10T14:30:00Z",
  },
  {
    id: "3",
    user: {
      id: "u3",
      name: "Lê Văn C",
      email: "vanc@google.com",
      avatarUrl: null,
    },
    jobTitle: "Data Scientist",
    company: "Google",
    yearsOfExperience: 12,
    status: "REJECTED",
    createdAt: "2024-05-08T09:15:00Z",
  },
];
