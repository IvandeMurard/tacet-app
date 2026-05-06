import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "contact@tacet.vercel.app";
const FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL ?? "Tacet <onboarding@resend.dev>";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { message, email, type, organisation } = body as Record<string, unknown>;

  if (typeof message !== "string" || message.trim().length < 10) {
    return NextResponse.json(
      { error: "Le message doit contenir au moins 10 caractères." },
      { status: 400 }
    );
  }

  if (email && (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  const isB2B = type === "b2b";
  const subject = isB2B
    ? "[Tacet B2B] Demande d'accès aux données"
    : "[Tacet] Feedback / suggestion";

  const html = `
    <p><strong>Type :</strong> ${isB2B ? "Demande B2B / accès données" : "Feedback / suggestion"}</p>
    ${isB2B && organisation ? `<p><strong>Organisation :</strong> ${String(organisation)}</p>` : ""}
    <p><strong>Message :</strong></p>
    <blockquote style="border-left:3px solid #0D9488;margin:0;padding:0 1em;color:#555">
      ${String(message).replace(/\n/g, "<br>")}
    </blockquote>
    <p><strong>Adresse de réponse :</strong> ${email ? String(email) : "(non renseignée)"}</p>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      ...(email ? { replyTo: String(email) } : {}),
      subject,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Resend error:", err);
    return NextResponse.json(
      { error: "Erreur d'envoi. Réessayez dans quelques instants." },
      { status: 500 }
    );
  }
}
