import Background from "./components/Layout/Background";
import Dashboard from "./components/Layout/Dashboard";

export default function App() {
  return (
    <>
      <Background />

      <main className="min-h-screen">
        <Dashboard />
      </main>
    </>
  );
}