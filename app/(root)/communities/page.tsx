import CommunityCard from "@/components/card/CommunityCard";
import Pagination from "@/components/shared/Pagination";
import SearchBar from "@/components/shared/SearchBar";
import { fetchCommunities } from "@/lib/actions/community.action";
import { fetchUser } from "@/lib/actions/user.action";
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
  
  const result = await fetchCommunities({
    searchString: searchParams.q,
    pageSize: 6,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
  })
  
  return (
    <>
    <h1 className='head-text'>Cộng đồng</h1>

    <div className='mt-5'>
      <SearchBar routeType='communities' />
    </div>

    <section className='mt-9 flex flex-wrap gap-4'>
      {result.communities.length === 0 ? (
        <p className='no-result'>No Result</p>
      ) : (
        <>
          {result.communities.map((community) => (
            <CommunityCard
              key={community.id}
              id={community.id}
              name={community.name}
              username={community.username}
              imgUrl={community.image}
              bio={community.bio}
              members={community.members}
            />
          ))}
        </>
      )}
    </section>

    <Pagination
      path='communities'
      pageNumber={searchParams?.page ? +searchParams.page : 1}
      isNext={result.isNext}
    />
  </>
  )


};

export default page;
