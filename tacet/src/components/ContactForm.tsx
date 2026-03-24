"use client";

import { useState } from "react";

const CONTACT_EMAIL = "contact@tacet.vercel.app"; // placeholder — replace with real address

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize message: strip \r (CR) to prevent CRLF injection
    const sanitizedMessage = message.replace(/\r/g, "");

    // Sanitize email: strip \r (CR) and \n (LF) to prevent header injection
    const sanitizedEmail = email.replace(/[\r\n]/g, "");

    const subject = encodeURIComponent("Contact Tacet");
    const body = encodeURIComponent(
      `Message:\n${sanitizedMessage}\n\n---\nEmail de réponse: ${sanitizedEmail || "(non renseigné)"}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  if (sent) {
    return (
      <p className="rounded-xl border border-white/20 bg-white/5 p-4 text-sm text-white/80">
        Votre client de messagerie a été ouvert. Envoyez le message pour nous contacter.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-message" className="mb-1 block text-xs font-medium text-white/70">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-teal-500 focus:outline-none"
          placeholder="Votre message, suggestion ou demande..."
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1 block text-xs font-medium text-white/70">
          Votre adresse e-mail (optionnel)
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
      <p className="text-[10px] text-white/50">
        En envoyant ce formulaire, vous acceptez que votre message et votre adresse e-mail
        soient transmis par courriel. Aucune donnée n’est enregistrée sur nos serveurs.
      </p>
      <button
        type="submit"
        className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500"
      >
        Ouvrir l’envoi par e-mail
      </button>
    </form>
  );
}
