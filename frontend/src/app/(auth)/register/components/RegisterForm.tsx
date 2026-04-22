"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/core/ui/Input";
import { Button } from "@/core/ui/Button";
import { AuthDivider, GoogleSignInButton, GitHubSignInButton } from "@/app/(auth)/components";
import { MESSAGES, UI_LABELS } from "@/shared/constants";
import { Icon } from "@/core/ui/Icon";
import { Checkbox } from "@/core/ui/Selection/Checkbox";
import { registerSchema, type RegisterFormData } from "@/app/(auth)/register/register.schema";

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      // TODO: replace with actual register API call
      console.log("Register data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch {
      setGeneralError(MESSAGES.ERROR.AUTH.GENERAL);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    if (provider === 'google') setIsGoogleLoading(true);
    if (provider === 'github') setIsGitHubLoading(true);
    
    try {
      // TODO: replace with actual OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      if (provider === 'google') setIsGoogleLoading(false);
      if (provider === 'github') setIsGitHubLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 text-left">
        <h2 className="text-3xl font-bold text-text-heading mb-3 tracking-tight">
          {UI_LABELS.AUTH.CREATE_ACCOUNT_TITLE}
        </h2>
        <p className="text-text-muted text-base leading-relaxed font-[Montserrat]">
          {UI_LABELS.AUTH.CREATE_ACCOUNT_SUBTITLE}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        <Input
          id="register-fullName"
          label={UI_LABELS.AUTH.FULL_NAME}
          type="text"
          placeholder="John Doe"
          error={errors.fullName?.message}
          autoComplete="name"
          iconLeft={<Icon name="User" size={20} />}
          {...register("fullName")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setFocus("email");
            }
          }}
        />

        <Input
          id="register-email"
          label={UI_LABELS.AUTH.EMAIL_ADDRESS}
          type="email"
          placeholder="example@academic.edu"
          error={errors.email?.message}
          autoComplete="email"
          iconLeft={<Icon name="Mail" size={20} />}
          {...register("email")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setFocus("password");
            }
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="register-password"
            label={UI_LABELS.AUTH.PASSWORD}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.password?.message}
            autoComplete="new-password"
            iconLeft={<Icon name="Lock" size={20} />}
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
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                tabIndex={-1}
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
              </button>
            }
          />

          <Input
            id="register-confirmPassword"
            label={UI_LABELS.AUTH.CONFIRM_PASSWORD}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            iconLeft={<Icon name="ShieldCheck" size={20} />}
            {...register("confirmPassword")}
            suffix={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-text-muted hover:text-text-heading transition-colors cursor-pointer focus:outline-none"
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                tabIndex={-1}
              >
                <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={20} />
              </button>
            }
          />
        </div>

        <div className="mt-1 flex items-center justify-between">
          <Checkbox
            id="agree-terms"
            label={
              <span className="text-sm">
                {UI_LABELS.AUTH.AGREE_TO_TERMS}{" "}
                <Link href="/terms" className="text-primary font-semibold hover:underline">
                  {UI_LABELS.AUTH.TERMS_OF_SERVICE}
                </Link>
              </span>
            }
          />
        </div>

        {generalError && (
          <p className="text-sm text-[#BA1A1A] bg-[#FFDAD6]/30 border border-[#BA1A1A]/30 rounded-xl px-4 py-3 font-[Montserrat]" role="alert">
            {generalError}
          </p>
        )}

        <Button
          type="submit"
          label={
            <span className="flex items-center justify-center gap-2">
              {isSubmitting ? UI_LABELS.AUTH.SIGNING_UP : UI_LABELS.AUTH.CREATE_ACCOUNT}
              {!isSubmitting && <Icon name="ArrowRight" size={18} />}
            </span>
          }
          variant="primary"
          size="md"
          fullWidth
          loading={isSubmitting}
          className="h-[52px] rounded-full text-base font-bold shadow-lg shadow-primary/20"
        />

        <p className="text-center text-sm text-text-muted mt-2 font-[Montserrat]">
          {UI_LABELS.AUTH.ALREADY_HAVE_ACCOUNT}{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline"
          >
            {UI_LABELS.AUTH.ENTER_LOGIN}
          </Link>
        </p>
      </form>

      <div className="mt-8">
        <AuthDivider text={UI_LABELS.AUTH.OR_QUICK_AUTH} />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <GoogleSignInButton
            label={UI_LABELS.AUTH.SIGN_UP_WITH_GOOGLE}
            onClick={() => handleSocialSignIn('google')}
            loading={isGoogleLoading}
          />
          <GitHubSignInButton
            label={UI_LABELS.AUTH.SIGN_IN_WITH_GITHUB}
            onClick={() => handleSocialSignIn('github')}
            loading={isGitHubLoading}
          />
        </div>
      </div>
    </div>
  );
}
