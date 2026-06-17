import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ahora = new Date();
  const fecha24hs = new Date(ahora);
  fecha24hs.setHours(ahora.getHours() + 24);
  const fechaStr = fecha24hs.toISOString().split("T")[0];
  const horaStr = fecha24hs.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  const { data: turnos } = await supabase
    .from("appointments")
    .select("*")
    .eq("date", fechaStr)
    .eq("time", horaStr)
    .eq("status", "confirmed")
    .eq("recordatorio_24hs", false);

  if (!turnos || turnos.length === 0) {
    return NextResponse.json({ message: "No hay recordatorios para enviar" });
  }

  let enviados = 0;
  for (const turno of turnos) {
    const [year, month, day] = turno.date.split("-");
    const mensaje = encodeURIComponent(
      `🌸 RECORDATORIO - Beauty Divina\n\n` +
      `Hola ${turno.client_name} ✨\n\n` +
      `Te recordamos que tienes un turno en 24 horas:\n\n` +
      `📅 ${day}/${month}/${year}\n` +
      `⏰ ${turno.time}hs\n` +
      `💅🏻 ${turno.service_name}\n` +
      `👩🏻‍💼 ${turno.professional_name}\n` +
      `📍 Cap. O. Cairo 601, Monte Grande\n\n` +
      `Confirmá tu asistencia respondiendo este mensaje 🧚🏻‍♀️✨`
    );
    console.log(`📱 Enviar a ${turno.client_phone}: ${mensaje}`);
    await supabase.from("appointments").update({ recordatorio_24hs: true }).eq("id", turno.id);
    enviados++;
  }

  return NextResponse.json({ enviados });
}