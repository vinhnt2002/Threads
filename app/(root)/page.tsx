import { redirect } from "next/navigation";

import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.action";
import { fetchThreads } from "@/lib/actions/thread.action";
import ThreadCard from "@/components/card/ThreadCard";
import Pagination from "@/components/shared/Pagination";

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // fucntion to fetch posts thread
  const result = await fetchThreads(
    searchParams.page ? +searchParams.page : 1,
    8
  );
  return (
    <>
      <h1 className="head-text text-left">Trang chủ</h1>
      <section className="mt-9 flex flex-col gap-10 ">
        {result.threads.length === 0 ? (
          <p className="no-result">No Threads found</p>
        ) : (
          <>
            {result.threads.map((thread) => (
              <ThreadCard
                key={thread._id}
                id={thread.id}
                currentUserId={user.id}
                parentId={thread.parentId}
                image={thread.image}
                content={thread.text}
                author={thread.author}
                community={thread.community}
                createdAt={thread.createdAt}
                comments={thread.children}
              />
            ))}
          </>
        )}

        <Pagination
          path="/"
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </section>
    </>
  );
}
