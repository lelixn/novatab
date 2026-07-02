import { useState } from "react";
import { Plus } from "lucide-react";

interface Props {
  onAdd(title: string): void;
}

export default function TodoInput({ onAdd }: Props) {
  const [value, setValue] = useState("");

  function submit() {
    if (!value.trim()) return;

    onAdd(value);

    setValue("");
  }

  return (
    <div className="flex gap-3">

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="New task..."
        className="
          flex-1
          rounded-xl
          bg-[#1A2238]
          px-4
          py-3
          outline-none
          text-white
        "
      />

      <button
        onClick={submit}
        className="
          rounded-xl
          bg-violet-600
          px-4
          hover:bg-violet-500
        "
      >
        <Plus />
      </button>

    </div>
  );
}