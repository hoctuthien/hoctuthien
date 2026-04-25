import type { Metadata } from "next";
import { RegisterForm } from "@/app/(auth)/register/components";

export const metadata: Metadata = {
  title: "Register | Học Từ Thiện",
  description: "Create a new account on Học Từ Thiện.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
