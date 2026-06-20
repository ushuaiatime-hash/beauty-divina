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

  // Buscar turnos en 2 horas
  const fecha2hs = new Date(ahora);
  fecha2hs.setHours(ahora.getHours() + 2);
  const fechaStr = fecha2hs.toISOString().split("T")[0];
  const horaStr = fecha2hs.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  console.log(`Buscando turnos para ${fechaStr} a las ${horaStr}`);

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
    const mensaje =
      `🌸 RECORDATORIO - Beauty Divina\n\n` +
      `Hola ${turno.client_name} ✨\n\n` +
      `Te recordamos que tienes un turno en 2 horas:\n\n` +
      `📅 ${day}/${month}/${year}\n` +
      `⏰ ${turno.time}hs\n` +
      `💅🏻 ${turno.service_name}\n` +
      `👩🏻‍💼 ${turno.professional_name}\n` +
      `📍 Cap. O. Cairo 601, Monte Grande\n\n` +
      `¡Te esperamos! ✨`;

    try {
      // Enviar por WhatsApp (si tenés Twilio configurado)
      // Si no, solo se registra en logs
      console.log(`📱 Enviar a ${turno.client_phone}: ${mensaje}`);
      await supabase.from("appointments").update({ recordatorio_24hs: true }).eq("id", turno.id);
      enviados++;
    } catch (error) {
      console.error(`❌ Error enviando a ${turno.client_phone}:`, error);
    }
  }

  return NextResponse.json({ enviados });
}