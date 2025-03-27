import { NextRequest, NextResponse } from "next/server";

// This can stay for local dev reference or fallback
// const webhookUrl = "https://davidajm.app.n8n.cloud/webhook/whatsapp-lead";

const TAG_MAP: { [message: string]: string } = {
  "¡Hola! Quiero más información sobre Exion.": "interes_exion_ene2025",
  "¡Hola! Quiero más información sobre cirugía dermatológica.": "interes_dermatología_ene2025",
  "¡Hola! Quiero más información sobre MOHS.": "interes_mohs_ene2025",
  "¡Hola! Quiero más información sobre cirugía plástica.": "interes_cirugía_plástica_ene2025",
  "¡Hola! Quiero más información de Emerald.": "interes_emerald_ene2025",
  "¡Hola! Quiero más información de Ultherapy.": "interes_ultherapy_ene2025",
  "¡Hola! Quiero más información sobre ácido hialurónico.": "interes_ácido_hialurónico_ene2025",
  "¡Hola! Quiero más información sobre Radiesse.": "interes_radiesse_ene2025",
  "¡Hola! Quiero más información de medicina regenerativa.": "interes_medicina_regenerativa_ene2025"
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const messageText = (body?.message || "").trim();
    const phone = String(body?.from || "").trim();
    const tag = TAG_MAP[messageText];

    if (!tag) {
      console.log("⚠️ No matching auto-message found. Ignored.");
      return NextResponse.json({ status: "ok" });
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("❌ Missing N8N_WEBHOOK_URL in environment variables");
      return NextResponse.json(
        { status: "error", message: "Webhook URL not set" },
        { status: 500 }
      );
    }

    console.log("🚀 Forwarding to webhook:", webhookUrl);
    console.log("📦 Payload:", { phone, tag });

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phone, tag })
    });

    if (!response.ok) {
      console.error("❌ Webhook call failed:", await response.text());
      return NextResponse.json(
        { status: "error", message: "Failed to reach webhook" },
        { status: 502 }
      );
    }

    console.log(`✅ Forwarded lead: ${phone} with tag: ${tag}`);
    return NextResponse.json({ status: "ok" });

  } catch (error) {
    console.error("💥 Error processing WhatsApp message:", error);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}