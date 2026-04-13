export interface UserPayload {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  // Thêm các trường khác tùy vào Token
  // file này tui tạo để làm frame cho code chính thức nha.
}
