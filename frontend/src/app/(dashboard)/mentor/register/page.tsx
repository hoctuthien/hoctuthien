import { Metadata } from "next";
import MentorRegisterClient from "./mentor-register-client";

export const metadata: Metadata = {
  title: "Đăng ký trở thành Mentor | Học Từ Thiện",
  description: "Tham gia đội ngũ Mentor để chia sẻ kiến thức và cùng nhau tạo nên giá trị cho cộng đồng.",
};

export default function MentorRegisterPage() {
  return <MentorRegisterClient />;
}
