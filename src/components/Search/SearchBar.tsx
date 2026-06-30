import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4">

      <Search className="mr-3 text-slate-400" size={20} />

      <input
        type="text"
        placeholder="Search Google..."
        className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
      />

    </div>
  );
}