import UserCard from "@/components/card/UserCard";
import Pagination from "@/components/shared/Pagination";
import SearchBar from "@/components/shared/SearchBar";
import { fetchUser, fetchUsers } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const allUser = await fetchUsers({
    userId: user.id,
    searchString: searchParams.q,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 10,
  });

  return (
    <section>
      <h1 className="head-text mb-10 ">Tìm kiếm</h1>
      <SearchBar routeType="search" />

      {/* list user  */}
      <div className="mt-14 flex flex-col gap-9">
        {allUser.users.length === 0 ? (
          <p className="no-result">No Result</p>
        ) : (
          <>
            {allUser.users.map((person) => (
              <UserCard
                key={person.id}
                id={person.id}
                name={person.name}
                username={person.username}
                imgUrl={person.image}
                personType="User"
              />
            ))}
          </>
        )}
      </div>
      <Pagination
        path="search"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={allUser.isNext}
      />
    </section>
  );
};

export default page;
