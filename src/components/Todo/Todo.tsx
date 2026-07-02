import { ClipboardList } from "lucide-react";

import Widget from "../common/widget/Widget";
import WidgetHeader from "../common/widget/WidgetHeader";
import WidgetBody from "../common/widget/WidgetBody";

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
    <Widget>

      <WidgetHeader
        title="TASKS"
        icon={<ClipboardList size={22} />}
      />

      <WidgetBody>

        <TodoInput onAdd={addTodo} />

        <div className="mt-5 space-y-3">

          {todos.map((todo) => (

            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={() => removeTodo(todo.id)}
              onToggle={() => toggleTodo(todo.id)}
            />

          ))}

        </div>

      </WidgetBody>

    </Widget>
  );
}