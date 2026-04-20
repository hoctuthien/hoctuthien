"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Input } from "@/core/ui/Input";
import { Button } from "@/core/ui/Button";
import { AuthDivider, GoogleSignInButton } from "@/app/(auth)/_components";
import { MESSAGES, UI_LABELS } from "@/shared/constants";
import { Icon } from "@/core/ui/Icon";
import { Checkbox } from "@/core/ui/Selection/Checkbox";

interface FormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function validateForm(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.email) {
    errors.email = MESSAGES.ERROR.AUTH.EMAIL_REQUIRED;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = MESSAGES.ERROR.AUTH.INVALID_EMAIL;
  }

  if (!values.password) {
    errors.password = MESSAGES.ERROR.AUTH.PASSWORD_REQUIRED;
  } else if (values.password.length < 8) {
    errors.password = MESSAGES.ERROR.AUTH.PASSWORD_MIN_LENGTH;
  }

  return errors;
}

export function LoginForm() {
  const [values, setValues] = useState<FormState>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // TODO: replace with actual auth API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch {
      setErrors({ general: MESSAGES.ERROR.AUTH.INVALID_CREDENTIALS });
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

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          id="login-email"
          label={UI_LABELS.AUTH.EMAIL_ADDRESS}
          type="email"
          placeholder="name@atelier.edu"
          value={values.email}
          onChange={handleChange("email")}
          onKeyDown={handleEmailKeyDown}
          error={errors.email}
          autoComplete="email"
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-sm font-semibold text-text-heading cursor-pointer font-[Montserrat]"
            >
              {UI_LABELS.AUTH.PASSWORD}
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline font-[Montserrat]"
            >
              {UI_LABELS.AUTH.FORGOT_PASSWORD}
            </Link>
          </div>
          <Input
            id="login-password"
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange("password")}
            error={errors.password}
            autoComplete="current-password"
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-muted hover:text-text-heading transition-colors"
                tabIndex={-1}
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
              </button>
            }
          />
        </div>

        <div className="mt-1">
          <Checkbox
            id="remember-me"
            label="Remember me"
            checked={values.rememberMe}
            onChange={(checked) =>
              setValues((prev) => ({ ...prev, rememberMe: checked }))
            }
          />
        </div>

        {errors.general && (
          <p className="text-sm text-[#BA1A1A] bg-[#FFDAD6]/30 border border-[#BA1A1A]/30 rounded-xl px-4 py-3 font-[Montserrat]">
            {errors.general}
          </p>
        )}

        <AuthDivider />

        <Button
          type="submit"
          label={isSubmitting ? "Entering..." : UI_LABELS.AUTH.ENTER_LOGIN}
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
