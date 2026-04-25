"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/core/ui/Input";
import { Button } from "@/core/ui/Button";
import { AuthDivider, GoogleSignInButton } from "@/app/(auth)/components";
import { MESSAGES, UI_LABELS } from "@/shared/constants";
import { Icon } from "@/core/ui/Icon";
import { Checkbox } from "@/core/ui/Selection/Checkbox";
import {
  loginSchema,
  type LoginFormData,
} from "@/app/(auth)/login/login.schema";

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      // TODO: replace with actual auth API call
      console.log("Login data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch {
      setGeneralError(MESSAGES.ERROR.AUTH.INVALID_CREDENTIALS);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // TODO: replace with actual Google OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-text-heading mb-3 tracking-tight">
          {UI_LABELS.AUTH.WELCOME_BACK}
        </h2>
        <p className="text-text-muted text-base leading-relaxed font-[Montserrat]">
          {UI_LABELS.AUTH.LOGIN_SUBTITLE}
        </p>
      </div>

      <GoogleSignInButton
        label={UI_LABELS.AUTH.SIGN_IN_WITH_GOOGLE}
        onClick={handleGoogleSignIn}
        loading={isGoogleLoading}
      />

      <AuthDivider text={UI_LABELS.AUTH.OR_CONTINUE_WITH_EMAIL} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        <Input
          id="login-email"
          label={UI_LABELS.AUTH.EMAIL_ADDRESS}
          type="email"
          placeholder="name@atelier.edu"
          error={errors.email?.message}
          autoComplete="email"
          {...register("email")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setFocus("password");
            }
          }}
        />

        <Input
          id="login-password"
          label={UI_LABELS.AUTH.PASSWORD}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.password?.message}
          autoComplete="current-password"
          {...register("password")}
          labelAction={
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline font-[Montserrat]"
            >
              {UI_LABELS.AUTH.FORGOT_PASSWORD}
            </Link>
          }
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

        <div className="mt-1">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="remember-me"
                label={UI_LABELS.AUTH.REMEMBER_ME}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {generalError && (
          <p
            className="text-sm text-[#BA1A1A] bg-[#FFDAD6]/30 border border-[#BA1A1A]/30 rounded-xl px-4 py-3 font-[Montserrat]"
            role="alert"
          >
            {generalError}
          </p>
        )}

        <AuthDivider />

        <Button
          type="submit"
          label={
            isSubmitting ? UI_LABELS.AUTH.ENTERING : UI_LABELS.AUTH.ENTER_LOGIN
          }
          variant="primary"
          size="md"
          fullWidth
          loading={isSubmitting}
        />
      </form>

      <p className="text-center text-sm text-text-muted mt-6 font-[Montserrat]">
        {UI_LABELS.AUTH.NEW_TO_ACCOUNT}{" "}
        <Link
          href="/register"
          className="text-primary font-semibold hover:underline"
        >
          {UI_LABELS.AUTH.CREATE_ACCOUNT}
        </Link>
      </p>
    </div>
  );
}
