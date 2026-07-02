import { useEffect, useState } from "react";
import { Todo } from "./todo.types";

const STORAGE_KEY = "nova-todos";

export function useTodo() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) {
        setTodos(result[STORAGE_KEY]);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({
      [STORAGE_KEY]: todos,
    });
  }, [todos]);

  function addTodo(title: string) {
    setTodos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        completed: false,
      },
    ]);
  }

  function removeTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed }
          : t
      )
    );
  }

  return {
    todos,
    addTodo,
    removeTodo,
    toggleTodo,
  };
}