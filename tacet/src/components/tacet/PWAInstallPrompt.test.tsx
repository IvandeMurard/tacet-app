import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PWAInstallPrompt } from "./PWAInstallPrompt";

const PROMPT_SHOWN_KEY = "tacet-pwa-prompt-shown";

// Helper: dispatch a fake beforeinstallprompt event that carries a mock prompt() fn
function fireInstallPromptEvent(promptFn = vi.fn().mockResolvedValue(undefined)) {
  const event = new Event("beforeinstallprompt") as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  };
  event.prompt = promptFn;
  event.userChoice = Promise.resolve({ outcome: "dismissed" as const });
  act(() => {
    window.dispatchEvent(event);
  });
  return promptFn;
}

beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe("PWAInstallPrompt", () => {
  it("renders nothing by default (no event fired)", () => {
    const { container } = render(<PWAInstallPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when sessionStorage flag is already set", () => {
    sessionStorage.setItem(PROMPT_SHOWN_KEY, "1");
    render(<PWAInstallPrompt />);
    fireInstallPromptEvent();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the install dialog when beforeinstallprompt fires", () => {
    render(<PWAInstallPrompt />);
    fireInstallPromptEvent();
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByRole("button", { name: "Installer" })).toBeDefined();
  });

  it("'Plus tard' button sets sessionStorage flag and hides the dialog", () => {
    render(<PWAInstallPrompt />);
    fireInstallPromptEvent();
    fireEvent.click(screen.getByText(/plus tard/i));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(sessionStorage.getItem(PROMPT_SHOWN_KEY)).toBe("1");
  });

  it("'Installer' button calls deferredPrompt.prompt()", async () => {
    render(<PWAInstallPrompt />);
    const promptFn = fireInstallPromptEvent();
    await act(async () => {
      fireEvent.click(screen.getByText(/^Installer$/));
    });
    expect(promptFn).toHaveBeenCalledTimes(1);
  });
});
