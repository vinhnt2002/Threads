import AccountProfile from "@/components/forms/AccountProfile";
import Heading from "@/components/ui/heading";
import { currentUser } from "@clerk/nextjs";

async function Page() {
  const user = await currentUser();
  if (!user) return null;
 
  const userInfo = {}

  // const userData = {
  //   id: user.id,
  //   objectId: userInfo?._id,
  //   username: userInfo ? userInfo?.username : user.username,
  //   name: userInfo ? userInfo?.name : user.firstName ?? "",
  //   bio: userInfo ? userInfo?.bio : "",
  //   image: userInfo ? userInfo?.image : user.imageUrl,
  // };
  const userData = {
    id: user.id,
    objectId: user.id,
    username: user.username ? user.username : "",
    name: user.firstName ?? "",
    bio: "",
    image:  user.imageUrl,
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <Heading
        title="Account Profile"
        description="Complete your profile now, to use Threds."
      />
      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile user={userData} btnTitle='Continue'/>
      </section>
    </main>
  );
};

export default Page;
