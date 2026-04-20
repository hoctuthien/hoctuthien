"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/core/ui/Input";
import { Button } from "@/core/ui/Button";
import { AuthDivider, GoogleSignInButton } from "@/app/(auth)/_components";

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function validateForm(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

export function LoginForm() {
  const [values, setValues] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
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
      setErrors({ general: "Invalid email or password. Please try again." });
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text-heading mb-2">
          Login Gateway
        </h2>
        <p className="text-text-muted text-sm leading-relaxed">
          Welcome back to the sanctuary. Please enter your details to access
          your sanctuary.
        </p>
      </div>

      <GoogleSignInButton
        label="Sign in with Google"
        onClick={handleGoogleSignIn}
        loading={isGoogleLoading}
      />

      <AuthDivider text="or continue with email" />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          id="login-email"
          label="Email Address"
          type="email"
          placeholder="name@atelier.edu"
          value={values.email}
          onChange={handleChange("email")}
          error={errors.email}
          autoComplete="email"
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-heading">
              Password
            </span>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange("password")}
            error={errors.password}
            autoComplete="current-password"
          />
        </div>

        {errors.general && (
          <p className="text-sm text-[#BA1A1A] bg-[#FFDAD6]/30 border border-[#BA1A1A]/30 rounded-xl px-4 py-3">
            {errors.general}
          </p>
        )}

        <Button
          type="submit"
          label={isSubmitting ? "Entering..." : "Enter the Sanctuary"}
          variant="primary"
          size="md"
          fullWidth
          loading={isSubmitting}
        />
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        New to the sanctuary?{" "}
        <Link
          href="/register"
          className="text-primary font-semibold hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
