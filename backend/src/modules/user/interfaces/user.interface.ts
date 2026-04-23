import { UserRole } from 'src/common/enums/database.enum';

export interface IUser {
  id: number;
  google_id?: string; // Thêm Google ID cho đăng nhập OAuth
  name: string;
  email: string;
  password_hash?: string; // Lưu mật khẩu đã băm
  phone?: string;
  avatar_url?: string;
  day_of_birth?: Date;
  gender?: string;
  timezone: string; // Mặc định 'UTC'
  role: UserRole;
  points: number; // Điểm thưởng tích lũy
  is_verified: boolean;

  // Sử dụng Record hoặc interface riêng cho JSONB nếu cần cấu trúc chặt chẽ
  preferences: Record<string, any>;
  metadata: Record<string, any>;

  status: string; // Mặc định 'active'
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date; // Dùng cho soft delete
}
