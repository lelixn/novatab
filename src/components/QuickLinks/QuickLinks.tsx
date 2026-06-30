export default function QuickLinks() {

  const links = [
    "GitHub",
    "ChatGPT",
    "LeetCode",
    "Gmail",
  ];

  return (
    <div className="flex justify-center gap-4">

      {links.map((link) => (

        <button
          key={link}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-white transition hover:bg-white/10"
        >
          {link}
        </button>

      ))}

    </div>
  );
}