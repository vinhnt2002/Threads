"use server"

import { FilterQuery, SortOrder } from "mongoose";
import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

export async function createCommunity(
    id: string,
    name: string,
    username: string,
    image: string,
    bio: string,
    createdById: string // Change the parameter name to reflect it's an id
  ) {
    try {
      connectToDB();
  
      // Find the user with the provided unique id
      const user = await User.findOne({ id: createdById });
  
      if (!user) {
        throw new Error("User not found"); // Handle the case if the user with the id is not found
      }
  
      const newCommunity = new Community({
        id,
        name,
        username,
        image,
        bio,
        createdBy: user._id, // Use the mongoose ID of the user
      });
  
      const createdCommunity = await newCommunity.save();
  
      // Update User model
      user.communities.push(createdCommunity._id);
      await user.save();
  
      return createdCommunity;
    } catch (error) {
      console.error("Error creating community:", error);
      throw error;
    }
  }
export async function fetchCommunityDetails(communityId: string) {
  try {
    await connectToDB();
    const communityDetails = await Community.findOne({
      id: communityId,
    }).populate([
      "createdBy",
      {
        path: "members",
        model: User,
        select: "name username image _id",
      },
    ]);

    return communityDetails;
  } catch (error: any) {
    throw new Error("Fail to fetch Member into Community", error.message);
  }
}

export async function fetchCommunityPosts(communityId: string) {
  try {
    await connectToDB();
    const communityThreads = await Community.findOne({
      id: communityId,
    }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id", // Select the "name" and "_id" fields from the "User" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id",
          },
        },
      ],
    });

    return communityThreads;
  } catch (error) {
    throw new Error("fail to fetch the Threads into Community");
  }
}

interface fetchCommunitiesProps {
  searchString?: string;
  pageSize?: number;
  pageNumber?: number;
  sortBy?: SortOrder;
}

// fetch and search
export async function fetchCommunities({
  searchString = "",
  pageSize = 20,
  pageNumber = 1,
  sortBy = "desc",
}: fetchCommunitiesProps) {
  try {
    await connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof Community> = {};

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalCommunityCount = await Community.countDocuments(query);

    const communities = await communitiesQuery.exec();
    const isNext = totalCommunityCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error: any) {
    throw new Error("fail to Search and fetch the community", error.message);
  }
}

// add member to community
export async function addMemberToCommunity(
  communityId: string,
  userId: string
) {
  try {
    await connectToDB();

    // find community have  ?
    const community = await Community.findOne({ id: communityId });
    if (!community) {
      throw new Error("Not found communtiy");
    }

    // find user have  ?
    const user = await User.findOne({ id: userId });
    if (!user) {
      throw new Error("Not found user");
    }

    // check user is already stay in community???
    if (community.members.include(user._id)) {
      throw new Error("User is already a member into communtiy");
    }

    // add user to community
    community.members.push(user._id);
    await community.save();

    // add community to user
    user.communities.push(community._id);
    await user.save();

    return community;
  } catch (error: any) {
    throw new Error("fail to add User into Community", error.message);
  }
}

// pratice later ///////////////////////////
export async function removeUserFromCommunity(
    userId: string,
    communityId: string
  ) {
    try {
      connectToDB();
  
      const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
      const communityIdObject = await Community.findOne(
        { id: communityId },
        { _id: 1 }
      );
  
      if (!userIdObject) {
        throw new Error("User not found");
      }
  
      if (!communityIdObject) {
        throw new Error("Community not found");
      }
  
      // Remove the user's _id from the members array in the community
      await Community.updateOne(
        { _id: communityIdObject._id },
        { $pull: { members: userIdObject._id } }
      );
  
      // Remove the community's _id from the communities array in the user
      await User.updateOne(
        { _id: userIdObject._id },
        { $pull: { communities: communityIdObject._id } }
      );
  
      return { success: true };
    } catch (error) {
      // Handle any errors
      console.error("Error removing user from community:", error);
      throw error;
    }
  }
  
  export async function updateCommunityInfo(
    communityId: string,
    name: string,
    username: string,
    image: string
  ) {
    try {
      connectToDB();
  
      // Find the community by its _id and update the information
      const updatedCommunity = await Community.findOneAndUpdate(
        { id: communityId },
        { name, username, image }
      );
  
      if (!updatedCommunity) {
        throw new Error("Community not found");
      }
  
      return updatedCommunity;
    } catch (error) {
      // Handle any errors
      console.error("Error updating community information:", error);
      throw error;
    }
  }
  
  export async function deleteCommunity(communityId: string) {
    try {
      connectToDB();
  
      // Find the community by its ID and delete it
      const deletedCommunity = await Community.findOneAndDelete({
        id: communityId,
      });
  
      if (!deletedCommunity) {
        throw new Error("Community not found");
      }
  
      // Delete all threads associated with the community
      await Thread.deleteMany({ community: communityId });
  
      // Find all users who are part of the community
      const communityUsers = await User.find({ communities: communityId });
  
      // Remove the community from the 'communities' array for each user
      const updateUserPromises = communityUsers.map((user) => {
        user.communities.pull(communityId);
        return user.save();
      });
  
      await Promise.all(updateUserPromises);
  
      return deletedCommunity;
    } catch (error) {
      console.error("Error deleting community: ", error);
      throw error;
    }
  }
