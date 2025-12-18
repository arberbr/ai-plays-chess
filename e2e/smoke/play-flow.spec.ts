import { expect, test } from "@playwright/test";

test.describe("play page smoke", () => {
  test("shows match controls and allows basic interactions", async ({ page }) => {
    await page.goto("/play");

    const start = page.getByRole("button", { name: /start match/i });
    const pause = page.getByRole("button", { name: /pause match/i });
    const resume = page.getByRole("button", { name: /resume match/i });
    const reset = page.getByRole("button", { name: /reset match/i });

    await expect(start).toBeVisible();
    await expect(pause).toBeVisible();
    await expect(resume).toBeVisible();
    await expect(reset).toBeVisible();

    await start.click();
    await pause.click();
    await resume.click();
    await reset.click();
  });
});
