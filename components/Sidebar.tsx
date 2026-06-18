"use client";

import { House, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import IconButton from "./IconButton";
import { useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-full relative">
      <aside
        className="bg-white flex-shrink-0 transition-all duration-300 flex flex-col items-center pt-6 gap-4 overflow-hidden"
        style={{ width: collapsed ? 0 : 90 }}
      >
        <IconButton icon={House} selected={pathname === "/"} onClick={() => router.push("/")} />
        <IconButton icon={User} selected={pathname === "/profile"} onClick={() => router.push("/profile")} />
      </aside>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute z-10 flex items-center justify-center w-6 h-10 rounded-md cursor-pointer"
        style={{
          background: "rgba(74, 131, 148, 1)",
          top: "50%",
          left: collapsed ? 3 : 84,
          transform: "translateY(-50%)",
        }}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-white" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-white" />
        )}
      </button>
    </div>
  );
}
