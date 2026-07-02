import MainLayout from "./components/Layout/MainLayout";
import Card from "./components/common/Card";
import SearchContainer from "./components/Search/SearchContainer";
import Todo from "./components/Todo/Todo";

export default function App() {
  return (
    <MainLayout>
      <SearchContainer />
      <Todo />
      <div className="mt-8 grid grid-cols-2 gap-6">
        <Card className="h-72 p-6">Todo</Card>

        <Card className="h-72 p-6">Pomodoro</Card>

        <Card className="h-72 p-6">GitHub</Card>

        <Card className="h-72 p-6">Weather</Card>
      </div>
    </MainLayout>
  );
}
