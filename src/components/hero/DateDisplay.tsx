export default function DateDisplay() {
  const today = new Date();

  return (
    <p className="mt-2 text-right text-slate-400">
      {today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    </p>
  );
}