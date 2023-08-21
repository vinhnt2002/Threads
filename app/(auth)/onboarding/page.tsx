import AccountProfile from "@/components/forms/AccountProfile";
import Heading from "@/components/ui/heading";
import { fetchUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (userInfo?.onboarded) redirect("/");

  const userData = {
    id: user.id,
    objectId: userInfo?._id,
    username: userInfo ? userInfo?.username : user.username,
    name: userInfo ? userInfo?.name : user.firstName ?? "",
    bio: userInfo ? userInfo?.bio : "",
    image: userInfo ? userInfo?.image : user.imageUrl,
  };

  // const userData = {
  //   id: user.id,
  //   objectId: user.id,
  //   username: user.username ? user.username : "",
  //   name: user.firstName ?? "",
  //   bio: "",
  //   image:  user.imageUrl,
  // };

  return (
    <main className="mx-auto flex max-w-4xl flex-col justify-start px-10 py-10">
      <Heading
        title="Thông tin tài khoản"
        description="Hoàn thành thông tin của bạn để có thể sử dụng Threads"
      />
      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile user={userData} btnTitle="Continue" />
      </section>
    </main>
  );
}

export default Page;
