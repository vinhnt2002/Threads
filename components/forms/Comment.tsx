"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";


import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { CommentValidation } from "@/lib/validations/thread";
import { addCommentToThread } from "@/lib/actions/thread.action";

interface CommentProps {
  threadId: string;
  currentUserImg: string;
  currentUserId: string;
}

const Comment: React.FC<CommentProps> = ({
  threadId,
  currentUserId,
  currentUserImg,
}) => {

  const pathname = usePathname();

  const form = useForm<z.infer<typeof CommentValidation>>({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    await addCommentToThread(
      threadId,
      values.thread,
      JSON.parse(currentUserId),
      pathname
    );
    

    form.reset();
  };

  const isLoading = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form className="comment-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full items-center gap-3">
              <FormLabel>
                <Image
                  src={currentUserImg}
                  alt="current_user"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input
                  type="text"
                  placeholder="Viết bình luận..."
                  className="no-focus text-light-1 outline-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="comment-form_btn ">
          Reply
        </Button>
      </form>
    </Form>
  );
};

export default Comment;
