"use client";

import { useState, useEffect } from "react";

const PROMPT_SHOWN_KEY = "tacet-pwa-prompt-shown";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstallPromptProps {
  /**
   * Set to true once the user has performed a meaningful action (e.g. first zone tap).
   * The install dialog is only shown after this flag becomes true, preventing the
   * prompt from appearing immediately on page load (E4-L1).
   */
  triggered?: boolean;
}

export function PWAInstallPrompt({ triggered = false }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(PROMPT_SHOWN_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Don't show yet — wait until triggered (first meaningful action)
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Show the dialog once the user has done something meaningful AND we have a deferred event
  useEffect(() => {
    if (triggered && deferredPrompt && !sessionStorage.getItem(PROMPT_SHOWN_KEY)) {
      setShowPrompt(true);
    }
  }, [triggered, deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") sessionStorage.setItem(PROMPT_SHOWN_KEY, "1");
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(PROMPT_SHOWN_KEY, "1");
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div
      className="fixed bottom-24 left-1/2 z-40 w-[320px] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/90 p-4 shadow-2xl backdrop-blur-xl"
      role="dialog"
      aria-label="Installer l'application"
    >
      <p className="mb-3 text-sm text-white/90">
        Installer Tacet sur votre appareil pour un accès rapide ?
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500"
        >
          Installer
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
