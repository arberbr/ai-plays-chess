import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { PieceColor } from "@/lib/chess/types";
import { BoardControls } from "../_components/board-controls";

describe("BoardControls", () => {
  it("displays orientation and last move, and triggers actions", async () => {
    const onFlip = vi.fn();
    const onReset = vi.fn();
    const user = userEvent.setup();

    render(
      <BoardControls
        orientation={PieceColor.White}
        lastMove={{ from: "e2", to: "e4" }}
        onFlip={onFlip}
        onReset={onReset}
      />
    );

    expect(screen.getByText(/white at bottom/i)).toBeInTheDocument();
    expect(screen.getByText(/e2 → e4/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /flip board orientation/i }));
    await user.click(screen.getByRole("button", { name: /reset board/i }));

    expect(onFlip).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
