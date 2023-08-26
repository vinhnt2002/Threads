"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../mongoose";

import Thread from "../models/thread.model";
import User from "../models/user.model";
import Community from "../models/community.model";

interface CreateThreadProps {
  text: string;
  image: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  image,
  author,
  communityId,
  path,
}: CreateThreadProps) {
  try {
    await connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdThread = await Thread.create({
      text,
      image,
      author,
      communityId: communityIdObject,
    });

    // update User Model to take the ObjectId of Thread
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error("Fail to Create Thread", error.message);
  }
}

//fetch threads
export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  await connectToDB();

  // caculate the number of post in page to skip
  const skipAmount = (pageNumber - 1) * pageSize;

  const threadQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parent image",
      },
    });

  const totalThreadsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const threads = await threadQuery.exec();
  // console.log(threads);

  const isNext = totalThreadsCount > skipAmount + threads.length;

  return { isNext, threads };
}

export async function fetchThreadById(threadId: string) {
  await connectToDB();
  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "community",
        model: Community,
      })
      .populate({
        path: "children",
        populate: [
          { path: "author", model: User, select: "_id id name image" },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name image",
            },
          },
        ],
      })
      .exec();

    // console.log(thread);

    return thread;
  } catch (error: any) {
    throw new Error("fail to fetch thread by id", error.message);
  }
}
// Add the comment to the thread
export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();
  try {
    //step 1 : find the thread with id
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // create new comment
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    // save to the database
    const saveCommentThread = await commentThread.save();

    //  Add the comment thread's ID to the original thread's children array
    originalThread.children.push(saveCommentThread._id);

    // save the originThread to database
    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error("Fail to Create Thread", error.message);
  }
}



// DECENDANTS : Hậu duệ, con cháu
async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  
  const childThreads = await Thread.find({ parentId: threadId });
  const thread = await Thread.findById(threadId)
  
  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}


export async function deleteThreads(
  id: string,
  path: string
): Promise<void> {
  try {
    await connectToDB();

    const mainThread = await Thread.findById(id).populate(
      "author community"
    );


    if (!mainThread) {
      throw new Error("Thread no found");
    }

    // fetch all decentdant of child of thread with the function fetchAllChildThreads above
    const descendantThreads = await fetchAllChildThreads(id);

    // after take all decentdant . delete it hen @@

    //step 1 take all thread id to delete many
    const decentdantThreadsId = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // step 2 take all relation to with community and author and delete
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );


    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    //delete
    await Thread.deleteMany({ _id: { $in: decentdantThreadsId } });

    //Update User again
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: decentdantThreadsId } } }
    );

    // Update Community again
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: decentdantThreadsId } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error("fail to delete threads", error.message);
  }
}
