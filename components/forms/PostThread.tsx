"use client";

import { useForm } from "react-hook-form";
import { ThreadValidation } from "@/lib/validations/thread";
import { usePathname, useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

//actions 
import { createThread } from "@/lib/actions/thread.action";

interface PostThreadProps {
  userId: string;
}
const PostThread: React.FC<PostThreadProps> = ({ userId }) => {

  const pathname = usePathname();
  const router = useRouter();
  console.log(userId);
  const form = useForm<z.infer<typeof ThreadValidation>>({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
    },
  });

  const onSubmit = async (values : z.infer<typeof ThreadValidation>) => {
    await createThread({
      text: values.thread,
      author: userId,
      //TO DO COMUNITY LATER
      communityId: null,
      path: pathname
    });

    router.push("/")
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary-500">
          Tạo Content
        </Button>
      </form>
    </Form>
  );
};

export default PostThread;
