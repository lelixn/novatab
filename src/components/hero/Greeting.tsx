import { useMemo } from "react";

export default function Greeting() {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "GOOD MORNING";

    if (hour < 17) return "GOOD AFTERNOON";

    if (hour < 21) return "GOOD EVENING";

    return "GOOD NIGHT";
  }, []);

  return (
    <>
      <h2
        className="text-5xl text-violet-300"
        style={{ fontFamily: "Pixelify Sans" }}
      >
        {greeting}
      </h2>

      <p className="mt-3 text-slate-400">
        Ready to build something legendary?
      </p>
    </>
  );
}