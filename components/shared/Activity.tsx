import { formatDateString } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ActivityProps {
  parentId: string;
  content: string;
  authorReplyName: string;
  authorReplyImage: string;
  createdAt: string;
}

const Activity: React.FC<ActivityProps> = ({
  parentId,
  content,
  authorReplyName,
  authorReplyImage,
  createdAt,
}) => {
  return (
    <div>
      <Link href={`/thread/${parentId}`}>
        <article className="activity-card flex justify-between rounded-md">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={authorReplyImage}
              alt={authorReplyName}
              width={20}
              height={20}
              className="object-cover rounded-full"
            />
            <p className="!text-small-regular text-light-1">
              <span className="mr-1 text-primary-500">
                {authorReplyName}
              </span>{" "}
              replied{" "}
              <span className="text-primary-500">"{content}" </span> to
              your thread
            </p>
          </div>

          <div className="text-subtle-medium text-gray-1">
            {formatDateString(createdAt)}
          </div>
        </article>
      </Link>
    </div>
  );
};
export default Activity;
