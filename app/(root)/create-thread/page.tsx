import React from "react";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";

const CreateThread = async () => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");
  return (
    <>
      <h1 className="head-text text-left">Create Thread</h1>
      <h2 className="head-text text-left">{userInfo.name}</h2>
    </>
  );
};

export default CreateThread;
