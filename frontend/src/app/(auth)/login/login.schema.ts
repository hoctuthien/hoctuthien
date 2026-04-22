import { z } from "zod";
import { MESSAGES } from "@/shared/constants";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, MESSAGES.ERROR.AUTH.EMAIL_REQUIRED)
    .email(MESSAGES.ERROR.AUTH.INVALID_EMAIL),
  password: z
    .string()
    .min(1, MESSAGES.ERROR.AUTH.PASSWORD_REQUIRED)
    .min(8, MESSAGES.ERROR.AUTH.PASSWORD_MIN_LENGTH),
  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;
