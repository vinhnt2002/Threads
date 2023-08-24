"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  routeType: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ routeType }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search) {
        router.push(`/${routeType}?q=` + search);
      } else {
        router.push(`/${routeType}`);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, routeType]);

  return (
    <div className="searchbar">
      <Image
        src="/assets/assets/search-gray.svg"
        alt="search_bar"
        width={24}
        height={24}
        className="object-contain"
      />
      <Input
        id="text"
        placeholder="search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="no-focus searchbar_input"
      />
    </div>
  );
};

export default SearchBar;
