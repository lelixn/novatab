export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#050816] overflow-hidden">

      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-violet-600/20 blur-[140px]" />

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]" />

    </div>
  );
}