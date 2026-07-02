import type { ReactNode } from "react";

export default function WidgetFooter({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      {children}
    </div>
  );
}