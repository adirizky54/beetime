import * as v from "valibot";

export const UpdateProfileSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty("Name is required.")),
  image: v.optional(v.nullable(v.pipe(v.string(), v.url("Must be a valid URL.")))),
});

export type UpdateProfileInput = v.InferOutput<typeof UpdateProfileSchema>;

export const ChangeEmailSchema = v.object({
  newEmail: v.pipe(v.string(), v.nonEmpty("Email is required."), v.email("Must be a valid email address.")),
});

export type ChangeEmailInput = v.InferOutput<typeof ChangeEmailSchema>;

export const ChangePasswordSchema = v.pipe(
  v.object({
    currentPassword: v.pipe(v.string(), v.nonEmpty("Current password is required.")),
    newPassword: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty("New password is required."),
      v.minLength(8, "Password must be at least 8 characters."),
      v.regex(/[a-z]/, "Must contain at least one lowercase letter."),
      v.regex(/[A-Z]/, "Must contain at least one uppercase letter."),
      v.regex(/[0-9]/, "Must contain at least one number."),
      v.regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/, "Must contain at least one special character."),
    ),
    confirmPassword: v.pipe(v.string(), v.nonEmpty("Please confirm your new password.")),
  }),
  v.forward(
    v.partialCheck(
      [["newPassword"], ["confirmPassword"]],
      (input) => input.newPassword === input.confirmPassword,
      "Passwords do not match.",
    ),
    ["confirmPassword"],
  ),
);

export type ChangePasswordInput = v.InferOutput<typeof ChangePasswordSchema>;

export const DeleteAccountSchema = v.object({
  password: v.pipe(v.string(), v.nonEmpty("Password is required to delete your account.")),
});

export type DeleteAccountInput = v.InferOutput<typeof DeleteAccountSchema>;
