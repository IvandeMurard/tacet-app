"use client";

import { useState } from "react";

type FormType = "feedback" | "b2b";
type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [type, setType] = useState<FormType>("feedback");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, email, type, organisation }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? "Erreur inconnue. Réessayez plus tard.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Impossible de contacter le serveur. Vérifiez votre connexion.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p className="rounded-xl border border-teal-500/30 bg-teal-950/50 p-4 text-sm text-teal-200">
        Message envoyé — merci ! Nous vous répondrons dans les meilleurs délais.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type selector */}
      <fieldset>
        <legend className="mb-2 text-xs font-medium text-white/70">Type de demande</legend>
        <div className="flex gap-3">
          {(
            [
              { value: "feedback", label: "Feedback / suggestion" },
              { value: "b2b", label: "Accès données (B2B)" },
            ] as { value: FormType; label: string }[]
          ).map(({ value, label }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                type === value
                  ? "border-teal-500/60 bg-teal-500/10 text-teal-300"
                  : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
              }`}
            >
              <input
                type="radio"
                name="contact-type"
                value={value}
                checked={type === value}
                onChange={() => setType(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Organisation — B2B only */}
      {type === "b2b" && (
        <div>
          <label
            htmlFor="contact-organisation"
            className="mb-1 block text-xs font-medium text-white/70"
          >
            Organisation <span className="text-white/40">(optionnel)</span>
          </label>
          <input
            id="contact-organisation"
            type="text"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-teal-500 focus:outline-none"
            placeholder="Nom de votre entreprise ou collectivité"
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label
          htmlFor="contact-message"
          className="mb-1 block text-xs font-medium text-white/70"
        >
          Message <span className="text-rose-400">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          minLength={10}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-teal-500 focus:outline-none"
          placeholder={
            type === "b2b"
              ? "Décrivez votre cas d'usage et les données souhaitées…"
              : "Votre retour, suggestion ou signalement…"
          }
        />
      </div>

      {/* Reply-to email */}
      <div>
        <label
          htmlFor="contact-email"
          className="mb-1 block text-xs font-medium text-white/70"
        >
          Adresse e-mail de réponse <span className="text-white/40">(optionnel)</span>
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-teal-500 focus:outline-none"
          placeholder="email@exemple.fr"
        />
      </div>

      <p className="text-[10px] text-white/40">
        Vos données sont transmises de manière sécurisée (HTTPS) et ne sont pas stockées sur nos
        serveurs. Elles sont utilisées uniquement pour traiter votre demande.
      </p>

      {status === "error" && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/50 px-3 py-2 text-sm text-rose-300">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Envoi en cours…" : "Envoyer le message"}
      </button>
    </form>
  );
}
