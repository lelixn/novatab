import { CloudSun } from "lucide-react";

export default function WeatherChip() {
  return (
    <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2">

      <CloudSun className="text-yellow-400" size={18} />

      <span className="text-sm">
        28°C
      </span>

      <span className="text-slate-400">
        Bhubaneswar
      </span>

    </div>
  );
}