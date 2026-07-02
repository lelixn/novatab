import { useState } from "react";
import { Search } from "lucide-react";
import { SEARCH_ENGINES } from "./SearchEngine";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  function handleSearch() {
    if (!query.trim()) return;

    const lower = query.toLowerCase();

    let url = SEARCH_ENGINES.google(query);

    if (lower.startsWith("gh ")) {
      url = SEARCH_ENGINES.github(query.slice(3));
    }

    else if (lower.startsWith("yt ")) {
      url = SEARCH_ENGINES.youtube(query.slice(3));
    }

    else if (lower.startsWith("so ")) {
      url = SEARCH_ENGINES.stackoverflow(query.slice(3));
    }

    else if (lower.startsWith("npm ")) {
      url = SEARCH_ENGINES.npm(query.slice(4));
    }

    else if (lower.startsWith("lc ")) {
      url = SEARCH_ENGINES.leetcode(query.slice(3));
    }

    else if (lower.startsWith("mdn ")) {
      url = SEARCH_ENGINES.mdn(query.slice(4));
    }

    window.open(url, "_blank");
  }

  return (
    <div className="relative">

      <Search
        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
        size={22}
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        placeholder="Search Google, GitHub, npm..."
        className="
        w-full
        rounded-2xl
        border
        border-white/10
        bg-[#111827]
        py-5
        pl-14
        pr-6
        text-lg
        text-white
        outline-none
        transition
        focus:border-violet-500
      "
      />

      <kbd
        className="
        absolute
        right-5
        top-1/2
        -translate-y-1/2
        rounded-lg
        border
        border-white/10
        bg-black/30
        px-3
        py-1
        text-xs
        text-slate-400
      "
      >
        ENTER
      </kbd>

    </div>
  );
}