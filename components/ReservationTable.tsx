"use client";

import { Pen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type ReservationRow = {
  id: string;
  unit: string;
  room: string;
  capacity: number;
  date: string;
  time: string;
  participants: number;
  consumption: string;
  hasEnded: boolean;
};

const PAGE_SIZE = 10;

export default function ReservationTable() {
  const router = useRouter();
  const [data, setData] = useState<ReservationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editAlertOpen, setEditAlertOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/reservations?page=${page}&pageSize=${PAGE_SIZE}`);
        const json = await res.json();
        if (json.error) {
          console.error("API error:", json);
          return;
        }
        const today = new Date().toISOString().slice(0, 10);
        const nowTime = new Date().toTimeString().slice(0, 5);
        setData(
          (json.data ?? []).map((r: any) => ({
            id: r.id,
            unit: r.unit?.name ?? "-",
            room: r.meeting_room?.name ?? "-",
            capacity: r.meeting_room?.capacity ?? 0,
            date: r.date,
            time: `${r.start_time?.slice(0, 5) ?? "?"} - ${r.end_time?.slice(0, 5) ?? "?"}`,
            participants: r.participants_count,
            consumption:
              r.reservation_consumptions
                ?.map((rc: any) => rc.consumption_type?.name)
                .filter(Boolean)
                .join(", ") || "-",
            hasEnded: r.date < today || (r.date === today && r.start_time <= nowTime),
          }))
        );
        setTotal(json.total ?? 0);
      } catch (err) {
        console.error("Failed to fetch reservations:", err);
      }
    })();
  }, [page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch("/api/reservations/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? "Gagal menghapus");
        return;
      }
      setData((prev) => prev.filter((r) => r.id !== deleteTarget));
      setTotal((prev) => prev - 1);
    } catch {
      alert("Gagal menghapus");
    } finally {
      setDeleteTarget(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <div
        className="w-full overflow-hidden"
        style={{
          border: "1px solid rgba(225, 225, 225, 1)",
          borderRadius: "8px",
          boxShadow: "0px 2px 8px rgba(204, 204, 204, 0.25)",
        }}
      >
        <Table className="bg-white border-0">
          <TableHeader>
            <TableRow style={{ background: "rgba(249, 250, 251, 1)" }}>
              <TableHead className="font-semibold text-gray-700 truncate max-w-[100px]">UNIT</TableHead>
              <TableHead className="font-semibold text-gray-700 truncate max-w-[140px]">RUANG MEETING</TableHead>
              <TableHead className="font-semibold text-gray-700 truncate max-w-[90px]">KAPASITAS</TableHead>
              <TableHead className="font-semibold text-gray-700 truncate max-w-[120px]">TANGGAL RAPAT</TableHead>
              <TableHead className="font-semibold text-gray-700 truncate max-w-[110px]">WAKTU</TableHead>
              <TableHead className="font-semibold text-gray-700 truncate max-w-[120px]">JUMLAH PESERT</TableHead>
              <TableHead className="font-semibold text-gray-700 truncate max-w-[150px]">JENIS KONSUMSI</TableHead>
              <TableHead className="font-semibold text-gray-700 truncate max-w-[90px]">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow style={{ background: "white" }}>
                <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                  Belum ada data reservasi
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row.id}
                  style={{
                    background: "white",
                    borderBottom: "1px solid rgba(225, 225, 225, 1)",
                  }}
                >
                  <TableCell className="truncate max-w-[100px]">{row.unit}</TableCell>
                  <TableCell className="truncate max-w-[140px]">{row.room}</TableCell>
                  <TableCell className="truncate max-w-[90px]">{row.capacity} Orang</TableCell>
                  <TableCell className="truncate max-w-[120px]">{row.date}</TableCell>
                  <TableCell className="truncate max-w-[110px]">{row.time}</TableCell>
                  <TableCell className="truncate max-w-[120px]">{row.participants} Orang</TableCell>
                  <TableCell className="truncate max-w-[150px]">{row.consumption}</TableCell>
                  <TableCell className="truncate max-w-[90px]">
                    <div className="flex items-center gap-2">
                      <Pen
                        className={`w-4 h-4 shrink-0 ${row.hasEnded ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                        style={{ color: "rgba(74, 131, 148, 1)" }}
                        onClick={() => {
                          if (row.hasEnded) {
                            setEditAlertOpen(true);
                          } else {
                            router.push(`/edit/${row.id}`);
                          }
                        }}
                      />
                      <Trash2
                        className="w-4 h-4 cursor-pointer shrink-0"
                        style={{ color: "rgba(255, 5, 5, 1)" }}
                        onClick={() => setDeleteTarget(row.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow style={{ background: "rgba(249, 250, 251, 1)" }}>
              <TableCell colSpan={8} className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Showing {from}-{to} of {total}
                  </span>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          disabled={page <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        />
                      </PaginationItem>
                      {getPageNumbers().map((p, i) =>
                        p === "ellipsis" ? (
                          <PaginationItem key={`e${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={p === page}
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          disabled={page >= totalPages}
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <AlertDialog open={editAlertOpen} onOpenChange={setEditAlertOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Tidak Dapat Mengedit</AlertDialogTitle>
          <AlertDialogDescription>
            Reservasi yang sedang atau sudah berlangsung tidak bisa diedit.
          </AlertDialogDescription>
          <div className="flex justify-end mt-4">
            <AlertDialogAction
              onClick={() => setEditAlertOpen(false)}
              className="h-9 rounded-md px-4 text-white text-sm"
              style={{ background: "rgba(74, 131, 148, 1)" }}
            >
              Tutup
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Reservasi</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus reservasi ini?
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel
              onClick={() => setDeleteTarget(null)}
              className="h-9 rounded-md px-4 text-sm"
              style={{
                background: "rgba(255, 220, 220, 1)",
                color: "rgba(255, 5, 5, 1)",
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="h-9 rounded-md px-4 text-white text-sm"
              style={{ background: "rgba(74, 131, 148, 1)" }}
            >
              Hapus
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
