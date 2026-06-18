"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Panel from "@/components/Panel";
import avatar from "@/assets/avatar.png";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center w-12 h-12 rounded-md cursor-pointer"
              style={{ background: "rgba(74, 131, 148, 1)" }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h4 className="font-bold text-lg">Profil</h4>
          </div>

          <Panel className="p-6">
            <div className="flex items-center gap-4">
              <img src={avatar.src} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold text-xl">John Doe</h3>
                <p className="text-sm text-gray-500">john.doe@example.com</p>
              </div>
            </div>
          </Panel>
        </main>
      </div>
    </div>
  );
}
