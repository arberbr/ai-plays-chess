import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/play", "/matches"];

test.describe("a11y @a11y", () => {
  for (const route of routes) {
    test(`page ${route} has no critical violations`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();

      const results = await new AxeBuilder({ page }).exclude("[data-square]").analyze();
      const criticalViolations = results.violations.filter(
        (violation) => violation.impact === "critical"
      );

      expect(criticalViolations).toEqual([]);
    });
  }
});
