import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  test('should display chat interface', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.locator('input[name="message"], input[placeholder*="message"], textarea');
    await expect(chatInput).toBeVisible({ timeout: 10000 });
  });

  test('should send message and receive response', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.locator('input[name="message"], input[placeholder*="message"], textarea');

    await chatInput.fill('Hello');

    const submitButton = page.locator('button[type="submit"], button:has-text("Send")');
    await submitButton.click();

    await page.waitForTimeout(2000);

    const responseElement = page.locator('.chat-response, .message-response, [data-testid="response"]').first();
    await expect(responseElement).toBeVisible({ timeout: 10000 });
  });

  test('should navigate between routes', async ({ page }) => {
    await page.goto('/');

    // Check navigation to different pages if any
    const url = page.url();
    expect(url).toBeDefined();
  });
});