export default function Header() {
  return (
    <header className="flex items-center justify-between">

      <div>

        <h2
          className="text-5xl text-violet-300"
          style={{ fontFamily: "Pixelify Sans" }}
        >
          GOOD MORNING
        </h2>

        <p className="mt-3 text-lg text-slate-400">
          Welcome back, Developer.
        </p>

      </div>

      <div className="text-right">

        <h1
          className="text-6xl text-white"
          style={{ fontFamily: "Pixelify Sans" }}
        >
          09:42
        </h1>

        <p className="mt-2 text-slate-400">
          Monday • June 30
        </p>

      </div>

    </header>
  );
}