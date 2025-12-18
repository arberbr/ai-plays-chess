import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { PieceColor, TurnLoopState } from "@/lib/chess/types";
import { MatchControls } from "../_components/match-controls";

const baseProps = {
  loopState: "idle" as TurnLoopState,
  turn: PieceColor.White,
  onStart: vi.fn(),
  onPause: vi.fn(),
  onResume: vi.fn(),
  onReset: vi.fn()
};

describe("MatchControls", () => {
  it("shows status and enables correct buttons", () => {
    render(<MatchControls {...baseProps} />);
    expect(screen.getByLabelText(/start match/i)).toBeEnabled();
    expect(screen.getByLabelText(/pause match/i)).toBeDisabled();
    expect(screen.getByLabelText(/resume match/i)).toBeDisabled();
    expect(screen.getByLabelText(/reset match/i)).toBeEnabled();
    expect(screen.getByText(/white to move/i)).toBeInTheDocument();
  });

  it("respects running/paused states and triggers callbacks", async () => {
    const user = userEvent.setup();
    const callbacks = {
      onStart: vi.fn(),
      onPause: vi.fn(),
      onResume: vi.fn(),
      onReset: vi.fn()
    };

    const { rerender } = render(<MatchControls {...baseProps} {...callbacks} loopState="running" />);
    await user.click(screen.getByLabelText(/pause match/i));
    expect(callbacks.onPause).toHaveBeenCalledTimes(1);

    rerender(<MatchControls {...baseProps} {...callbacks} loopState="paused" />);
    await user.click(screen.getByLabelText(/resume match/i));
    expect(callbacks.onResume).toHaveBeenCalledTimes(1);
  });
});
