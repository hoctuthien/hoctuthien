import type { Metadata } from 'next';
import { LoginForm } from './_components/LoginForm';

export const metadata: Metadata = {
  title: 'Login — Học Từ Thiện',
  description: 'Sign in to access your Học Từ Thiện account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
