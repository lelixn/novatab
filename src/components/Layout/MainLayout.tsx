import Sidebar from "./Sidebar";
import Header from "./Header";
import Background from "./Background";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
  <div className="relative flex h-screen overflow-hidden">

    <Background />

    <Sidebar />

    <main className="relative flex-1 overflow-y-auto p-10">

      <Header />

      <div className="mt-10">

        {children}

      </div>

    </main>

  </div>
);
}