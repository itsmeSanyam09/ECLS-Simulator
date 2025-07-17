import { z } from "zod";

export const loginValidationSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormData = z.infer<typeof loginValidationSchema>;