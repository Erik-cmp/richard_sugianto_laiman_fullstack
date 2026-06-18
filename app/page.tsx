"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ReservationTable from "@/components/ReservationTable";
import { ChevronLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                className="flex items-center justify-center w-12 h-12 rounded-md"
                style={{ background: "rgba(74, 131, 148, 1)" }}
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h4 className="font-bold text-lg">Ruang Meeting</h4>
                <p className="text-sm text-gray-500">Ruang Meeting</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/create")}
              className="flex items-center gap-2 h-12 rounded-md px-4 cursor-pointer"
              style={{ background: "rgba(74, 131, 148, 1)" }}
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white font-medium text-sm">Pesan Ruangan</span>
            </button>
          </div>
          <ReservationTable />
        </main>
      </div>
    </div>
  );
}
