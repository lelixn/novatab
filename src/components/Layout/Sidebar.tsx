import {
  House,
  Search,
  ListTodo,
  Timer,
  GitBranch,
  Code2,
  Terminal,
  Settings,
} from "lucide-react";

const menu = [
  { icon: House, label: "Home" },
  { icon: Search, label: "Search" },
  { icon: ListTodo, label: "Tasks" },
  { icon: Timer, label: "Pomodoro" },
  { icon: GitBranch, label: "Git" },
  { icon: Code2, label: "LeetCode" },
  { icon: Terminal, label: "Commands" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-white/10 bg-[#0B1023]/80 backdrop-blur-xl">

      <div className="border-b border-white/10 p-8">

        <h1
          className="text-3xl text-violet-400"
          style={{ fontFamily: "Pixelify Sans" }}
        >
          NOVA://OS
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Developer Cockpit
        </p>

      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-3 px-4">

        {menu.map((item) => {

          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className="
              flex
              items-center
              gap-4
              rounded-xl
              px-4
              py-3
              text-slate-300
              transition-all
              duration-300
              hover:bg-violet-500/15
              hover:text-violet-300
            "
            >
              <Icon size={20} />

              <span>{item.label}</span>

            </button>
          );
        })}

      </nav>

      <div className="border-t border-white/10 p-5 text-center text-xs text-slate-500">
        v1.0.0
      </div>

    </aside>
  );
}