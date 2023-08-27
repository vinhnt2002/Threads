import { fetchCommunities } from "@/lib/actions/community.action";
import { currentUser } from "@clerk/nextjs";
import UserCard from "../card/UserCard";
import { fetchUsers } from "@/lib/actions/user.action";

const RightSidebar = async () => {
  const user = await currentUser();
  if (!user) return null;

  const suggestCommunity = await fetchCommunities({ pageSize: 3 });

  const friends = await fetchUsers({userId: user.id,pageSize: 3})

  return (
    <section className="custom-scrollbar rightsidebar">
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">Đề Xuất</h3>
        <div className="mt-7 flex w-[350px] flex-col gap-9">
          {suggestCommunity.communities.length > 0 ? (
            <>
              {suggestCommunity.communities.map((community) => (
                <UserCard
                  key={community.id}
                  id={community.id}
                  name={community.name}
                  username={community.username}
                  imgUrl={community.image}
                  personType="Community"
                />
              ))}
            </>
          ) : (
            <p className="!text-base-regular text-light-3">
              No communities yet
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">Người dùng gần đây</h3>
        <div className="mt-7 flex w-[350px] flex-col gap-10">
        {friends.users.length > 0 ? (
            <>
              {friends.users.map((user) => (
                <UserCard
                  key={user.id}
                  id={user.id}
                  name={user.name}
                  username={user.username}
                  imgUrl={user.image}
                  personType="User"
                />
              ))}
            </>
          ) : (
            <p className="!text-base-regular text-light-3">
              No user yet
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
