"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";
import { Icon } from "@/core/ui/Icon";
import { authGateway } from "@/core/gateway/authGateway";

type Step = "request" | "reset" | "success";

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const maybeError = error as {
      error?: { message?: string };
      message?: string;
    };
    return maybeError.error?.message || maybeError.message || fallback;
  }
  return fallback;
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authGateway.forgotPassword({ email });
      setMessage("Nếu email tồn tại, mã OTP đã được gửi. Vui lòng kiểm tra hộp thư.");
      setStep("reset");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể gửi OTP. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      setLoading(false);
      return;
    }

    try {
      await authGateway.resetPassword({
        email,
        otp,
        newPassword,
      });
      setStep("success");
      setMessage("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "OTP không hợp lệ hoặc đã hết hạn."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-5"
        >
          <Icon name="ChevronLeft" size={16} />
          Quay lại đăng nhập
        </Link>
        <h2 className="text-3xl md:text-4xl font-bold text-text-heading mb-3 tracking-tight">
          Quên mật khẩu
        </h2>
        <p className="text-text-muted text-base leading-relaxed font-[Montserrat]">
          Nhập email tài khoản để nhận mã OTP. Mã mới nhất sẽ thay thế mã cũ và chỉ dùng được một lần.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {step === "request" && (
        <form onSubmit={requestOtp} className="flex flex-col gap-5">
          <Input
            id="forgot-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            required
          />

          <Button
            type="submit"
            label={loading ? "Đang gửi..." : "Gửi mã OTP"}
            loading={loading}
            fullWidth
          />
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={resetPassword} className="flex flex-col gap-5">
          <Input
            id="reset-email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            id="reset-otp"
            label="Mã OTP"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            required
          />

          <Input
            id="new-password"
            label="Mật khẩu mới"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            required
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="text-text-muted hover:text-text-heading transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
              </button>
            }
          />

          <Input
            id="confirm-password"
            label="Nhập lại mật khẩu mới"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              label="Gửi lại OTP"
              disabled={loading || !email}
              onClick={() => requestOtp()}
            />
            <Button
              type="submit"
              label={loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              loading={loading}
            />
          </div>
        </form>
      )}

      {step === "success" && (
        <Button
          label="Đăng nhập ngay"
          fullWidth
          onClick={() => router.push("/login")}
        />
      )}
    </div>
  );
}
