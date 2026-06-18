import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
      id,
      unit_id,
      meeting_room_id,
      capacity,
      date,
      start_time,
      end_time,
      participants_count,
      amount,
      unit:unit_id ( id, name ),
      meeting_room:meeting_room_id ( id, name, capacity ),
      reservation_consumptions (
        consumption_type:consumption_type_id ( id, name )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
