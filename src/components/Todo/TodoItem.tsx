import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Todo } from "./todo.types";

interface Props {
  todo: Todo;

  onToggle(): void;

  onDelete(): void;
}

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
}: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        flex
        items-center
        justify-between
        rounded-xl
        bg-[#141B2D]
        p-3
      "
    >
      <label className="flex items-center gap-3">

        <input
          type="checkbox"
          checked={todo.completed}
          onChange={onToggle}
        />

        <span
          className={
            todo.completed
              ? "line-through text-slate-500"
              : ""
          }
        >
          {todo.title}
        </span>

      </label>

      <button onClick={onDelete}>
        <Trash2 size={18} />
      </button>

    </motion.div>
  );
}