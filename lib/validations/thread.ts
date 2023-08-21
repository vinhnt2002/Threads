import * as z from "zod";

export const ThreadValidation = z.object({
  thread: z
    .string()
    .nonempty()
    .min(3, { message: "Vui lòng nhập ít nhất 3 kí tự" }),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  thread: z
    .string()
    .nonempty()
    .min(3, { message: "Vui lòng nhập ít nhất 3 kí tự" }),
});
