"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../mongoose";

import { FilterQuery, Model, SortOrder } from "mongoose";

import User from "../models/user.model";
import Thread from "../models/thread.model";

interface updateUserParams {
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
}: updateUserParams): Promise<void> {
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

interface fetchUsersParams {
  userId: string;
  searchString?: string;
  pageSize?: number;
  pageNumber?: number;
  sortBy?: SortOrder;
}

// fetch and search
export async function fetchUsers({
  userId,
  searchString = "",
  pageSize = 20,
  pageNumber = 1,
  sortBy = "desc",
}: fetchUsersParams) {
  try {
    await connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = { id: { $ne: userId } };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;
    return { isNext, users };
  } catch (error: any) {
    throw new Error("Fail to fetch all user in database", error.message);
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

    // console.log(threads);
    return threads;
  } catch (error: any) {
    throw new Error("fail to fetchUserPosts ", error.message);
  }
}

// export async function fetchUserComments(userId: string, parentId: string) {
//   await connectToDB();
//   try {
//     const comments = await User.findOne({ id: userId }).populate({
//       path: "threads",
//       model: Thread,
//       populate: [
//         {
//           path: "children",
//           model: Thread,
//           match: { parentId: parentId },
//           populate: {
//             path: "author",
//             model: Thread,
//             select: "name image id",
//           },
//         },
//       ],
//     });

//     if(!comments) {
//       throw new Error("User comment not found");
//     }
//     const extractedReplies = comments.threads.reduce((acc : any, thread : any) => {
//       return acc.concat(thread.children);
//     }, []);

//     // console.log(extractedReplies);
//     return extractedReplies;

//   } catch (error: any) {
//     throw new Error("fail to fetchUserComments ", error.message);
//   }
// }

export async function getActivity(userId: string) {
  try {
    connectToDB();
    // find all thread create by User
    const userThreads = await Thread.find({ author: userId });

    // Collect all the child thread ids (replies) from the 'children' field of each user thread
    const childThreadIds = userThreads.reduce((acc, userThreads) => {
      return acc.concat(userThreads.children);
    }, []);

    // Find and return the child threads (replies) excluding the ones created by the same user
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image id",
    });
    return replies;
  } catch (error: any) {
    throw new Error("Fail to get Activity", error.message);
  }
}
