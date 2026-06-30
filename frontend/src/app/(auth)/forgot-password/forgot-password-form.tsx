"use client";

import { useTranslations } from 'next-intl';
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
  const tExtracted = useTranslations('Extracted.appAuthForgotPasswordForgotPasswordForm');
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
      setMessage(tExtracted('neuEmailTonTaiMaOtpDaDuoc'));
      setStep("reset");
    } catch (err: unknown) {
      setError(getErrorMessage(err, tExtracted('khongTheGuiOtpVuiLongThuLai')));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(tExtracted('matKhauNhapLaiKhongKhop'));
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
      setMessage(tExtracted('datLaiMatKhauThanhCongBanCo'));
    } catch (err: unknown) {
      setError(getErrorMessage(err, tExtracted('otpKhongHopLeHoacDaHetHan')));
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
          {tExtracted('quayLaiDangNhap')}</Link>
        <h2 className="text-3xl md:text-4xl font-bold text-text-heading mb-3 tracking-tight">
          {tExtracted('quenMatKhau')}</h2>
        <p className="text-text-muted text-base leading-relaxed font-[Montserrat]">
          {tExtracted('nhapEmailTaiKhoanDeNhanMaOtp')}</p>
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
            label={tExtracted('email')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            required
          />

          <Button
            type="submit"
            label={loading ? tExtracted('dangGui') : tExtracted('guiMaOtp')}
            loading={loading}
            fullWidth
          />
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={resetPassword} className="flex flex-col gap-5">
          <Input
            id="reset-email"
            label={tExtracted('email')}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            id="reset-otp"
            label={tExtracted('maOtp')}
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            required
          />

          <Input
            id="new-password"
            label={tExtracted('matKhauMoi')}
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
                aria-label={showPassword ? tExtracted('anMatKhau') : tExtracted('hienMatKhau')}
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
              </button>
            }
          />

          <Input
            id="confirm-password"
            label={tExtracted('nhapLaiMatKhauMoi')}
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
              label={tExtracted('guiLaiOtp')}
              disabled={loading || !email}
              onClick={() => requestOtp()}
            />
            <Button
              type="submit"
              label={loading ? tExtracted('dangDatLai') : tExtracted('datLaiMatKhau')}
              loading={loading}
            />
          </div>
        </form>
      )}

      {step === "success" && (
        <Button
          label={tExtracted('dangNhapNgay')}
          fullWidth
          onClick={() => router.push("/login")}
        />
      )}
    </div>
  );
}
