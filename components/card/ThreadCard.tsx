import Link from "next/link";
import Image from "next/image";
import { formatDateString } from "@/lib/utils";
import DeleteThread from "../forms/DeleteThread";
interface ThreadCardProps {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  image?: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
}
const ThreadCard: React.FC<ThreadCardProps> = ({
  id,
  currentUserId,
  image,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
}) => {
  return (
    <article
      className={`flex w-full flex-col rounded-xl ${
        isComment ? "px-0 xs::p-7" : "bg-dark-2 p-7"
      }  `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex w-full flex-1 flex-row gap-4">
          {/* image  */}
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              <Image
                src={author.image}
                alt={author.name}
                fill
                className="rounded-full cursor-pointer"
              />
            </Link>
            <div className="thread-card_bar" />
          </div>
          {/* info user   */}
          <div className="flex w-full flex-col ">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <Link href={`/profile/${author.id}`} className="w-fit">
                  <h4 className="cursor-pointer text-base-semibold text-light-1">
                    {author.name}
                  </h4>
                  {image && (
                    <div className="text-light-1 mt-5 w-[200px] h-[30vh] md:w-[500px] md:h-[50vh] relative">
                      <Image
                        src={image}
                        alt="tsst"
                        fill
                        className="rounded-md"
                      />
                    </div>
                  )}
                </Link>
                <p className="mt-2  text-small-regular text-light-2">
                  {content}
                </p>
              </div>

              <div className="w-full flex justify-end mt-2 gap-2">
                {
                  <p className="text-subtle-semibold text-gray-1 p-0 md:p-1">
                    {formatDateString(createdAt)}
                  </p>
                }
                        <DeleteThread
          threadId={JSON.stringify(id)}
          currentUserId={currentUserId}
          authorId={author.id}
          parentId={parentId}
          isComment={isComment}
        />
              </div>
            </div>

            <div
              className={`${
                isComment && "mb-10"
              } flex flex-col mt-5 text-light-1`}
            >
              <div className="flex gap-3.5">
                <Image
                  src="/assets/assets/heart-gray.svg"
                  width={34}
                  height={34}
                  alt="icon"
                  className="cursor-pointer object-contain hover:scale-105"
                />
                <Link href={`/thread/${id}`}>
                  <Image
                    src="/assets/assets/reply.svg"
                    width={34}
                    height={34}
                    alt="icon"
                    className="cursor-pointer object-contain hover:scale-105"
                  />
                </Link>

                <Image
                  src="/assets/assets/repost.svg"
                  width={34}
                  height={34}
                  alt="icon"
                  className="cursor-pointer object-contain hover:scale-105"
                />
                <Image
                  src="/assets/assets/share.svg"
                  width={34}
                  height={34}
                  alt="icon"
                  className="cursor-pointer object-contain hover:scale-105"
                />
              </div>
              {isComment && comments.length > 0 && (
                <div className="flex items-center mt-3 ml-1 gap-2">
                  {comments.slice(0, 2).map((comments, index) => (
                    <Image
                      key={index}
                      src={comments.author.image}
                      alt={`user_${index}`}
                      width={34}
                      height={34}
                      className={` ${
                        index != 0 && "-ml-5"
                      } rounded-full object-cover`}
                    />
                  ))}

                  <Link href={`/thread/${id}`}>
                    <p className="mt-1 text-subtle-medium text-gray-1">
                      {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                    </p>
                  </Link>
                </div>
              )}
            </div>
          </div>

      </div>
        </div>

      {/* {!isComment && community && (
        <Link
          href={`/communities/${community.id}`}
          className="mt-5 flex items-center"
        >
          <p className="text-subtle-medium text-gray-1">
            {formatDateString(createdAt)}
            {community && ` - ${community.name} Community`}
          </p>

          <Image
            src={community.image}
            alt={community.name}
            width={14}
            height={14}
            className="ml-1 rounded-full object-cover"
          />
        </Link>
      )} */}
    </article>
  );
};

export default ThreadCard;
