"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Panel from "@/components/Panel";
import Divider from "@/components/Divider";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const TIME_SLOTS: string[] = [];
for (let h = 8; h < 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}
TIME_SLOTS.push("20:00");

export default function EditReservation() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);

  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [rooms, setRooms] = useState<{ id: string; name: string; capacity: number }[]>([]);
  const [consumptionTypes, setConsumptionTypes] = useState<{ id: string; name: string }[]>([]);

  const [unitId, setUnitId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [roomCapacity, setRoomCapacity] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [participants, setParticipants] = useState("");
  const [participantsError, setParticipantsError] = useState("");
  const [selectedConsumptions, setSelectedConsumptions] = useState<string[]>([]);
  const [consumptionNominal, setConsumptionNominal] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmBatal, setConfirmBatal] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, title: "", message: "" });
  const [successDialog, setSuccessDialog] = useState(false);

  useEffect(() => {
    (async () => {
      const [uRes, rRes, cRes, dRes] = await Promise.all([
        fetch("/api/units"),
        fetch("/api/meeting-rooms"),
        fetch("/api/consumption-types"),
        fetch(`/api/reservations/detail?id=${id}`),
      ]);
      const uData = await uRes.json();
      const rData = await rRes.json();
      const cData = await cRes.json();
      const dData = await dRes.json();

      setUnits(uData);
      setRooms(rData);
      setConsumptionTypes(cData);

      if (dData.id) {
        setUnitId(dData.unit_id ?? "");
        setRoomId(dData.meeting_room_id ?? "");
        setRoomCapacity(dData.meeting_room?.capacity ?? null);
        setDate(dData.date ?? "");
        setStartTime(dData.start_time?.slice(0, 5) ?? "");
        setEndTime(dData.end_time?.slice(0, 5) ?? "");
        setParticipants(String(dData.participants_count ?? ""));
        setConsumptionNominal(String(dData.amount ?? ""));
        setSelectedConsumptions(
          (dData.reservation_consumptions ?? []).map((rc: any) => rc.consumption_type?.id).filter(Boolean)
        );
      }

      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (roomId) {
      const room = rooms.find((r) => r.id === roomId);
      setRoomCapacity(room?.capacity ?? null);
    } else {
      setRoomCapacity(null);
    }
  }, [roomId, rooms]);

  useEffect(() => {
    const num = parseInt(participants);
    if (roomCapacity !== null && num > roomCapacity) {
      setParticipantsError(`Jumlah peserta tidak boleh melebihi kapasitas ruangan (${roomCapacity} orang)`);
    } else {
      setParticipantsError("");
    }
  }, [participants, roomCapacity]);

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const allTodaySlots = TIME_SLOTS.slice(0, -1);
  const todayAvailable = allTodaySlots.filter((t) => {
    const [h, m] = t.split(":").map(Number);
    const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    return slotTime >= threeHoursLater;
  });

  const minDate = todayAvailable.length === 0
    ? new Date(now.getTime() + 86400000).toISOString().slice(0, 10)
    : today;

  const availableStartSlots = date === today ? todayAvailable : allTodaySlots;

  const handleToggleConsumption = (id: string) => {
    setSelectedConsumptions((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const showError = (title: string, message: string) => setErrorDialog({ open: true, title, message });

  const handleSimpan = async () => {
    const numParticipants = parseInt(participants);
    if (!unitId || !roomId || !date || !startTime || !endTime || !participants) {
      showError("Validasi", "Harap isi semua field");
      return;
    }
    if (numParticipants > (roomCapacity ?? 0)) {
      showError("Validasi", "Jumlah peserta melebihi kapasitas ruangan");
      return;
    }
    if (startTime >= endTime) {
      showError("Validasi", "Waktu selesai harus setelah waktu mulai");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/reservations/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          unit_id: unitId,
          meeting_room_id: roomId,
          date,
          start_time: startTime,
          end_time: endTime,
          participants_count: numParticipants,
          consumption_items: selectedConsumptions,
          amount: consumptionNominal ? parseInt(consumptionNominal) : 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showError("Gagal Menyimpan", json.error ?? "Terjadi kesalahan");
        return;
      }
      setSuccessDialog(true);
    } catch {
      showError("Gagal Menyimpan", "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleBatal = () => setConfirmBatal(true);

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-6">
            <p className="text-gray-500">Memuat data...</p>
          </main>
        </div>
      </div>
    );
  }

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
            <div>
              <h4 className="font-bold text-lg">Edit Reservasi</h4>
              <div className="flex items-center gap-2 text-sm mt-1">
                <span className="text-gray-500">Ruang Meeting</span>
                <ChevronRight className="w-4 h-4" style={{ color: "rgba(74, 131, 148, 1)" }} />
                <span className="text-gray-500">Edit Reservasi</span>
              </div>
            </div>
          </div>

          <Panel className="p-6">
            <h3 className="font-semibold text-lg mb-4">Informasi Ruang Meeting</h3>
            <Divider />
            <div className="pt-4 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full h-10 rounded-md px-4 text-sm bg-white"
                  style={{ border: "1px solid rgba(225, 225, 225, 1)" }}
                >
                  <option value="">Pilih Unit</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilihan Ruangan</label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full h-10 rounded-md px-4 text-sm bg-white"
                  style={{ border: "1px solid rgba(225, 225, 225, 1)" }}
                >
                  <option value="">Pilih Ruangan</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Ruangan</label>
                <input
                  type="text"
                  disabled
                  value={roomCapacity !== null ? `${roomCapacity} Orang` : ""}
                  className="w-full h-10 rounded-md px-4 text-sm bg-gray-100 text-gray-500"
                  style={{ border: "1px solid rgba(225, 225, 225, 1)" }}
                />
              </div>
            </div>
          </Panel>

          <div className="mt-6">
            <Panel className="p-6">
              <h3 className="font-semibold text-lg mb-4">Informasi Rapat</h3>
              <Divider />
              <div className="pt-4 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Rapat</label>
                  <input
                    type="date"
                    value={date}
                    min={minDate}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setStartTime("");
                      setEndTime("");
                    }}
                    className="w-full h-10 rounded-md px-4 text-sm bg-white"
                    style={{ border: "1px solid rgba(225, 225, 225, 1)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai</label>
                  <select
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      if (endTime && e.target.value >= endTime) setEndTime("");
                    }}
                    className="w-full h-10 rounded-md px-4 text-sm bg-white"
                    style={{ border: "1px solid rgba(225, 225, 225, 1)" }}
                  >
                    <option value="">Pilih Waktu</option>
                    {availableStartSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Selesai</label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-10 rounded-md px-4 text-sm bg-white"
                    style={{ border: "1px solid rgba(225, 225, 225, 1)" }}
                  >
                    <option value="">Pilih Waktu</option>
                    {TIME_SLOTS.filter((t) => t > startTime).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Peserta</label>
                  <input
                    type="number"
                    min={1}
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    className="w-full h-10 rounded-md px-4 text-sm bg-white"
                    style={{ border: "1px solid rgba(225, 225, 225, 1)" }}
                  />
                  {participantsError && (
                    <p className="text-xs mt-1" style={{ color: "rgba(255, 5, 5, 1)" }}>{participantsError}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Konsumsi</label>
                <div className="flex flex-wrap gap-4">
                  {consumptionTypes.map((ct) => (
                    <label key={ct.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedConsumptions.includes(ct.id)}
                        onChange={() => handleToggleConsumption(ct.id)}
                        className="w-4 h-4"
                      />
                      {ct.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Konsumsi (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={consumptionNominal}
                    onChange={(e) => setConsumptionNominal(e.target.value)}
                    placeholder="Rp"
                    className="w-full h-10 rounded-md px-4 text-sm bg-white"
                    style={{ border: "1px solid rgba(225, 225, 225, 1)" }}
                  />
                </div>
              </div>
            </Panel>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleBatal}
              className="h-10 rounded-md px-6 text-sm font-medium cursor-pointer"
              style={{
                background: "rgba(255, 220, 220, 1)",
                color: "rgba(255, 5, 5, 1)",
              }}
            >
              Batal
            </button>
            <button
              onClick={handleSimpan}
              disabled={saving}
              className="h-10 rounded-md px-6 text-sm font-medium text-white cursor-pointer disabled:opacity-60"
              style={{ background: "rgba(74, 131, 148, 1)" }}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
