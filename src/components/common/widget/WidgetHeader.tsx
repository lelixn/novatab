import type { ReactNode } from "react";

interface WidgetHeaderProps {
  icon: ReactNode;
  title: string;
  color?: string;
}

export default function WidgetHeader({
  icon,
  title,
  color = "text-violet-400",
}: WidgetHeaderProps) {
  return (
    <div className="mb-5 flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div
          className={`
            flex h-10 w-10 items-center justify-center
            rounded-xl bg-white/5 ${color}
          `}
        >
          {icon}
        </div>

        <h2
          className="text-xl tracking-wider text-white"
          style={{ fontFamily: "Pixelify Sans" }}
        >
          {title}
        </h2>

      </div>

    </div>
  );
}