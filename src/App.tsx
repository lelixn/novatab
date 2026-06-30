import MainLayout from "./components/Layout/MainLayout";
import Card from "./components/common/Card";

export default function App() {
  return (
    <MainLayout>
      <div className="grid grid-cols-2 gap-6">

        <Card className="h-72 p-6">
          Todo Widget
        </Card>

        <Card className="h-72 p-6">
          Pomodoro Widget
        </Card>

        <Card className="h-72 p-6">
          GitHub Widget
        </Card>

        <Card className="h-72 p-6">
          Weather Widget
        </Card>

      </div>
    </MainLayout>
  );
}