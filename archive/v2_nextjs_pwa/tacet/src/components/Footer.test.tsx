import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the footer with correct role and label", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeDefined();
    expect(footer.getAttribute("aria-label")).toBe("Pied de page");
  });

  it("renders all expected links with correct destinations", () => {
    render(<Footer />);

    const links = [
      { text: "Mentions légales", href: "/mentions-legales" },
      { text: "Politique de confidentialité", href: "/confidentialite" },
      { text: "Vue accessible", href: "/accessible" },
      { text: "Nous contacter", href: "/contact" },
    ];

    links.forEach(({ text, href }) => {
      const link = screen.getByRole("link", { name: text });
      expect(link).toBeDefined();
      expect(link.getAttribute("href")).toBe(href);
    });
  });

  it("has correct styling classes", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.className).toContain("fixed");
    expect(footer.className).toContain("bottom-0");
  });
});
