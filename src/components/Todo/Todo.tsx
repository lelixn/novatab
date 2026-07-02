import Card from "../../components/common/Card";
import TodoInput from "./TodoInput";
import TodoItem from "./TodoItem";
import { useTodo } from "./useTodo";

export default function Todo() {
  const {
    todos,
    addTodo,
    removeTodo,
    toggleTodo,
  } = useTodo();

  return (
    <Card className="p-6">

      <h2
        className="mb-6 text-2xl text-violet-300"
        style={{
          fontFamily: "Pixelify Sans",
        }}
      >
        TASKS
      </h2>

      <TodoInput onAdd={addTodo} />

      <div className="mt-6 space-y-3">

        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onDelete={() =>
              removeTodo(todo.id)
            }
            onToggle={() =>
              toggleTodo(todo.id)
            }
          />
        ))}

      </div>

    </Card>
  );
}