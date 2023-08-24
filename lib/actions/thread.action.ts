"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../mongoose";

import Thread from "../models/thread.model";
import User from "../models/user.model";

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
}: CreateThreadProps)  {
  try {
    await connectToDB();
    const createdThread = await Thread.create({
      text,
      image,
      author,
      communityId: null,
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
