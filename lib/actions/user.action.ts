"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import Thread from "../models/thread.model";

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId });
    // .populate({
    //   path: "communities",
    //   model: Community,
    // }
    // );
  } catch (error: any) {
    throw new Error(`Fail to fetch User ${error.message}`);
  }
}

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  path: string;
  image: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  path,
  image,
}: Params): Promise<void> {
  try {
    await connectToDB();

    // Find and update the user
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    // Revalidate the path if needed
    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  await connectToDB();

  try {
    // fetch all threads of user
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: "Thread",
      populate: [
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: Thread,
            select: "name image id",
          },
        },
      ],
    });

    return threads;
  } catch (error: any) {
    throw new Error("fail to fetchUserPosts ", error.message);
  }
}
