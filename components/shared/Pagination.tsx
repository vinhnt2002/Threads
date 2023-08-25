"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  path: string;
  pageNumber: number;
  isNext: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  path,
  pageNumber,
  isNext,
}) => {
  // console.log(path);
  // console.log(pageNumber);
  // console.log(isNext);

  const router = useRouter();

  const handlePagination = (type: string) => {
    let nextPageNumber = pageNumber;

    if (type === "prev") {
      nextPageNumber = Math.max(1, pageNumber - 1);
    } else if (type === "next") {
      nextPageNumber = pageNumber + 1;
    }

    if (nextPageNumber > 1) {
      router.push(`/${path}?page=${nextPageNumber}`);
    } else {
      router.push(`{path}`);
    }
  };
  if (!isNext && pageNumber === 1) return null;

  return (
    <div className="pagination">
      <Button
        onClick={() => handlePagination("prev")}
        disabled={pageNumber === 1}
        className="!text-small-regular text-light-2  hover:scale-110"
      >
        prev
      </Button>
      <p className="text-small-semibold text-light-1">{pageNumber}</p>
      <Button
        onClick={() => handlePagination("next")}
        disabled={pageNumber === 1}
        className="!text-small-regular text-light-2 hover:scale-110"
      >
        next
      </Button>
    </div>
  );
};

export default Pagination;
