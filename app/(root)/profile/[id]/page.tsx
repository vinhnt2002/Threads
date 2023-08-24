import ProfileHeader from "@/components/shared/ProfileHeader";
import { fetchUser, getActivity } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";
import Activity from "@/components/shared/Activity";

const ProfilePage = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(params.id);
  const activity = await getActivity(userInfo._id);

  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
      />
      <div className="mt-9">
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain hover:scale-110"
                />
                <p className="max-sm:hidden">{tab.label}</p>
                {tab.label === "Bài Viết" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {userInfo.threads.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* {profileTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className="w-full text-light-1"
            >
              <ThreadsTab
                currentUserId={user.id}
                accountId={userInfo.id}
                accountType="User"
              />
            </TabsContent>
          ))} */}
          <TabsContent value="threads" className="w-full text-light-1">
            <ThreadsTab
              currentUserId={user.id}
              accountId={userInfo.id}
              accountType="User"
            />
          </TabsContent>
          <TabsContent value="replies" className="w-full text-light-1">
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
                <p className="!text-base-regular no-result mt-20 text-light-4">
                  No activity yet
                </p>
              )}
            </section>
          </TabsContent>
          <TabsContent value="tagged" className="w-full text-light-1">
            <p className="no-result mt-20 text-light-4">
              Sorry Tính năng đang được phát triển thêm
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ProfilePage;
