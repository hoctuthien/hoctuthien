/**
 * Shared Type: User
 * Định nghĩa User cho toàn bộ hệ thống (Mentor, Mentee, Admin).
 */
export interface IUser {
  id: string;
  email: string;
  fullName: string;
  role: 'mentee' | 'mentor' | 'admin';
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
}
