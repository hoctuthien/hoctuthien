import { ForgotPasswordForm } from './forgot-password-form';

export const metadata = {
  title: 'Quên mật khẩu | Học Từ Thiện',
  description: 'Nhận mã OTP qua email để đặt lại mật khẩu tài khoản.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
