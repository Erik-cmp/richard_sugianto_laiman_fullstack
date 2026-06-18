import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get("pageSize") ?? "10")));

  const { data, error, count } = await supabase
    .from("reservations")
    .select(
      `
      id,
      date,
      start_time,
      end_time,
      participants_count,
      unit_id,
      meeting_room_id,
      amount,
      unit:unit_id ( name ),
      meeting_room:meeting_room_id ( name, capacity ),
      reservation_consumptions (
        consumption_type:consumption_type_id ( name, id )
      )
      `,
      { count: "exact" }
    );

  if (error) {
    return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 5);

  const sorted = [...(data ?? [])].sort((a: any, b: any) => {
    const aPast = a.date < today || (a.date === today && a.end_time <= nowTime) ? 1 : 0;
    const bPast = b.date < today || (b.date === today && b.end_time <= nowTime) ? 1 : 0;
    if (aPast !== bPast) return aPast - bPast;
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.start_time < b.start_time ? -1 : 1;
  });

  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const paginated = sorted.slice(from, to);

  return NextResponse.json({ data: paginated, total: count ?? 0 });
}
