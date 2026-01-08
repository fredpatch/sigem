import { z, ZodSchema } from "zod";

export function validate<T extends ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    const err = new Error("ValidationError") as Error & {
      status?: number;
      details?: any;
    };
    err.status = 400;
    err.details = issues;
    throw err;
  }
  return parsed.data;
}
