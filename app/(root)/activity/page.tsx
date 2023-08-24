import Activity from "@/components/shared/Activity";
import { fetchUser, getActivity } from "@/lib/actions/user.action";
import { formatDateString } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo.onboarded) redirect("/onboarding");

  const activity = await getActivity(userInfo._id);
  return (
    <>
      <h1 className="head-text">Hoạt Động </h1>
      <section className="mt-10 flex flex-col gap-5">
        {activity.length > 0 ? (
          <>
            {activity.map((activity) => (
              <Activity
                key={activity._id}
                parentId={activity.parentId}
                content={activity.text}
                authorReplyName={activity.author.name}
                authorReplyImage={activity.author.image}
                createdAt={activity.createdAt}
              />
            ))}
          </>
        ) : (
          <p className="!text-base-regular text-light-3">No activity yet</p>
        )}
      </section>
    </>
  );
};

export default page;
