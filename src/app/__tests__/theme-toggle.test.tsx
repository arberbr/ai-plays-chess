import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ThemeToggle } from "../theme-toggle";

const toggleThemeMock = vi.fn();

vi.mock("../theme-provider", () => {
  const useTheme = () => ({
    theme: "dark" as const,
    resolvedTheme: "dark" as const,
    setTheme: vi.fn(),
    toggleTheme: toggleThemeMock
  });
  return { useTheme };
});

describe("ThemeToggle", () => {
  it("shows dark state and toggles on click", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /switch to light mode/i });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("Dark");

    await user.click(button);
    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });
});
