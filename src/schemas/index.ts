import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .refine((email) => email.search("@"), {
      message: "Please enter a valid email",
    }),
  password: z.string(),
});

export const signupSchema = z.object({
  name: z.string(),
  email: z
    .string()
    .email()
    .refine((email) => email.search("@"), {
      message: "Please enter a valid email",
    }),
  password: z
    .string()
    .min(8)
    .max(32)
    .refine((password) => password.search(/[A-Z]/) !== -1, {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((password) => password.search(/[a-z]/) !== -1, {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((password) => password.search(/[0-9]/) !== -1, {
      message: "Password must contain at least one number",
    })
    .refine(
      (password) =>
        password.search(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/) !== -1,
      {
        message: "Password must contain at least one special character",
      }
    ),
  password_confirmation: z.string().min(8).max(32),
});
