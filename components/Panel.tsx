import type { ReactNode } from "react";

export default function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white w-full ${className}`}
      style={{
        border: "1px solid rgba(225, 225, 225, 1)",
        borderRadius: "8px",
        boxShadow: "0px 2px 8px rgba(204, 204, 204, 0.25)",
      }}
    >
      {children}
    </div>
  );
}
