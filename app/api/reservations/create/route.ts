import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const body = await req.json();
  const { unit_id, meeting_room_id, date, start_time, end_time, participants_count, consumption_items, amount } = body;

  if (!unit_id || !meeting_room_id || !date || !start_time || !end_time || !participants_count) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  const { data: room } = await supabase
    .from("meeting_room")
    .select("capacity")
    .eq("id", meeting_room_id)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Ruangan tidak ditemukan" }, { status: 404 });
  }

  if (participants_count > room.capacity) {
    return NextResponse.json({ error: "Jumlah peserta melebihi kapasitas ruangan" }, { status: 400 });
  }

  if (start_time >= end_time) {
    return NextResponse.json({ error: "Waktu selesai harus setelah waktu mulai" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    return NextResponse.json({ error: "Tanggal tidak boleh di masa lalu" }, { status: 400 });
  }

  if (date === today) {
    const now = new Date();
    const [h, m] = start_time.split(":").map(Number);
    const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    if (slotTime < threeHoursLater) {
      return NextResponse.json({ error: "Waktu mulai harus setidaknya 3 jam dari sekarang" }, { status: 400 });
    }
  }

  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .insert({
      unit_id,
      meeting_room_id,
      capacity: room.capacity,
      date,
      start_time,
      end_time,
      participants_count,
      amount: amount ?? 0,
    })
    .select("id")
    .single();

  if (reservationError) {
    return NextResponse.json({ error: reservationError.message }, { status: 500 });
  }

  if (consumption_items && consumption_items.length > 0) {
    const junctionRows = consumption_items.map((consumption_type_id: string) => ({
      reservation_id: reservation.id,
      consumption_type_id,
    }));

    const { error: junctionError } = await supabase
      .from("reservation_consumptions")
      .insert(junctionRows);

    if (junctionError) {
      return NextResponse.json({ error: junctionError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, id: reservation.id });
}
