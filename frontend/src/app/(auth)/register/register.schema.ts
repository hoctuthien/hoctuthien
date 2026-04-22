import { z } from "zod";
import { MESSAGES } from "@/shared/constants";

export const registerSchema = z
  .object({
    fullName: z.string().min(1, MESSAGES.ERROR.AUTH.FULL_NAME_REQUIRED),
    email: z
      .string()
      .min(1, MESSAGES.ERROR.AUTH.EMAIL_REQUIRED)
      .email(MESSAGES.ERROR.AUTH.INVALID_EMAIL),
    password: z
      .string()
      .min(1, MESSAGES.ERROR.AUTH.PASSWORD_REQUIRED)
      .min(8, MESSAGES.ERROR.AUTH.PASSWORD_MIN_LENGTH),
    confirmPassword: z.string().min(1, MESSAGES.ERROR.AUTH.PASSWORD_CONFIRM_REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: MESSAGES.ERROR.AUTH.PASSWORDS_MUST_MATCH,
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
