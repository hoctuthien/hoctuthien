"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Input } from "@/core/ui/Input";
import { Button } from "@/core/ui/Button";
import { AuthDivider, GoogleSignInButton } from "@/app/(auth)/components";
import { Icon } from "@/core/ui/Icon";
import { Checkbox } from "@/core/ui/Selection/Checkbox";
import {
  registerSchema,
  type RegisterFormData,
} from "@/app/(auth)/register/register.schema";
import { authGateway } from "@/core/gateway/authGateway";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ensureDeviceId } from "@/shared/utils/device";

export function RegisterForm() {
  const t = useTranslations("Auth");
  const tError = useTranslations("Error");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      // Gọi API đăng ký
      ensureDeviceId();
      await authGateway.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Đăng nhập tự động sau khi đăng ký thành công
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      const callbackUrl = searchParams.get("callbackUrl") || "/";

      if (!result || result.error) {
        // Fallback: chuyển hướng đến trang đăng nhập nếu auto-login thất bại
        router.push("/login?registered=true");
      } else if (result.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error: any) {
      console.error("[RegisterForm] Submit Error:", error);
      // Hiển thị lỗi từ API nếu có
      const apiErrorMessage = error.error?.details?.message || error.error?.message || (error?.message !== 'API Request failed' ? error?.message : null);
      if (apiErrorMessage) {
        setGeneralError(apiErrorMessage);
      } else {
        setGeneralError(tError("default") || "Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    if (provider === "google") setIsGoogleLoading(true);

    const callbackUrl = searchParams.get("callbackUrl") || "/";

    try {
      ensureDeviceId();
      await signIn(provider, { callbackUrl });
    } catch (error) {
      console.error(`${provider} login failed:`, error);
    } finally {
      if (provider === "google") setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-left">
        <h2 className="text-3xl font-bold text-text-heading mb-2 tracking-tight">
          {t("createAccountTitle")}
        </h2>
        <p className="text-text-muted text-sm leading-relaxed font-[Montserrat]">
          {t("createAccountSubtitle")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <Input
          id="register-name"
          label={t("fullName") || "Full Name"}
          type="text"
          placeholder="Nguyen Van A"
          error={errors.name?.message}
          autoComplete="name"
          containerClassName="gap-1.5"
          {...register("name")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setFocus("email");
            }
          }}
        />
        <Input
          id="register-email"
          label={t("emailAddress")}
          type="email"
          placeholder="example@academic.edu"
          error={errors.email?.message}
          autoComplete="email"
          containerClassName="gap-1.5"
          {...register("email")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setFocus("password");
            }
          }}
        />

        <Input
          id="register-password"
          label={t("password")}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.password?.message}
          autoComplete="new-password"
          containerClassName="gap-1.5"
          {...register("password")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setFocus("confirmPassword");
            }
          }}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-muted hover:text-text-heading transition-colors cursor-pointer focus:outline-none"
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              tabIndex={-1}
            >
              <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
            </button>
          }
        />

        <Input
          id="register-confirmPassword"
          label={t("confirmPassword")}
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          containerClassName="gap-1.5"
          {...register("confirmPassword")}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-text-muted hover:text-text-heading transition-colors cursor-pointer focus:outline-none"
              aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
              tabIndex={-1}
            >
              <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={20} />
            </button>
          }
        />

        <div className="flex items-center justify-between">
          <Controller
            name="agreeTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="agree-terms"
                checked={field.value}
                onChange={field.onChange}
                label={
                  <span className="text-xs">
                    {t("agreeToTerms")}{" "}
                    <Link
                      href="/terms"
                      className="text-primary font-semibold hover:underline"
                    >
                      {t("termsOfService")}
                    </Link>
                  </span>
                }
              />
            )}
          />
        </div>

        {generalError && (
          <p
            className="text-sm text-[#BA1A1A] bg-[#FFDAD6]/30 border border-[#BA1A1A]/30 rounded-xl px-4 py-2 font-[Montserrat]"
            role="alert"
          >
            {generalError}
          </p>
        )}

        <Button
          type="submit"
          label={
            <span className="flex items-center justify-center gap-2">
              {isSubmitting
                ? t("signingUp")
                : t("createAccount")}
              {!isSubmitting && <Icon name="ArrowRight" size={18} />}
            </span>
          }
          variant="primary"
          size="md"
          fullWidth
          loading={isSubmitting}
          className="h-[50px] rounded-full text-base font-bold shadow-lg shadow-primary/20"
        />

        <p className="text-center text-sm text-text-muted font-[Montserrat]">
          {t("alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline"
          >
            {t("signIn")}
          </Link>
        </p>
      </form>

      <div className="mt-6">
        <AuthDivider text={t("orQuickAuth")} />
        <div className="mt-4">
          <GoogleSignInButton
            label={t("signUpWithGoogle")}
            onClick={() => handleSocialSignIn("google")}
            loading={isGoogleLoading}
          />
        </div>
      </div>
    </div>
  );
}
