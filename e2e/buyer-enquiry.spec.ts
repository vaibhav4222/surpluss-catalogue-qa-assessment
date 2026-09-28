import { expect, test } from "@playwright/test";

test("buyer can submit an enquiry and admin can see it in Leads Inbox", async ({ page }) => {
  await page.goto("/catalogue/premium-corporate-essentials");

  const productCard = page.locator("article").filter({ hasText: "Atlas cabin trolley" }).first();
  await expect(productCard.getByText("Atlas cabin trolley")).toBeVisible();
  await productCard.getByRole("button", { name: "Contact Us" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Contact supplier" })).toBeVisible();

  await dialog.getByLabel("Your name *").fill("Interview Buyer");
  await dialog.getByLabel("WhatsApp number").fill("9876543210");
  await dialog.getByRole("button", { name: "Send enquiry" }).click();

  await expect(dialog.getByText("Enquiry sent")).toBeVisible();
  const reference = await dialog.getByText(/^ENQ-\d{7}$/).textContent();
  expect(reference).toMatch(/^ENQ-\d{7}$/);

  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@catalogue.test");
  await page.getByLabel("Password").fill("Admin#2026");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.goto("/admin/leads");
  await expect(page.getByText(reference!)).toBeVisible();
  await expect(page.getByText("Interview Buyer")).toBeVisible();
});
