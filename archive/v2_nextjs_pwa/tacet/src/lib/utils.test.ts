import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("handles conditional classes", () => {
    expect(cn("class1", true && "class2", false && "class3")).toBe("class1 class2");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("handles array inputs", () => {
    expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
  });

  it("handles object inputs", () => {
    expect(cn({ class1: true, class2: false }, "class3")).toBe("class1 class3");
  });

  it("handles undefined, null, and empty strings", () => {
    expect(cn("class1", undefined, null, "", "class2")).toBe("class1 class2");
  });

  it("handles a complex mix of inputs", () => {
    expect(
      cn(
        "text-base",
        ["font-bold", { "text-red-500": false, "text-blue-500": true }],
        undefined,
        "p-4",
        "p-8",
        null
      )
    ).toBe("text-base font-bold text-blue-500 p-8");
  });
});
