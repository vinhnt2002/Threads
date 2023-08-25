"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { deleteThreads } from "@/lib/actions/thread.action";

interface Props {
  threadId: string;
  currentUserId: string;
  authorId: string;
  parentId: string | null;
  isComment?: boolean;
}

function DeleteThread({
  threadId,
  currentUserId,
  authorId,
  parentId,
  isComment,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  if (currentUserId !== authorId || pathname === "/") return null;

  return (
    <div className="">
    
    <Image
      src='/assets/assets/delete.svg'
      alt='delte'
      width={18}
      height={18}
      className='cursor-pointer object-contain'
      onClick={async () => {
        await deleteThreads(JSON.parse(threadId), pathname);
        if (!parentId || !isComment) {
          router.push("/");
        }
      }}
    />
    </div>

  );
}

export default DeleteThread;