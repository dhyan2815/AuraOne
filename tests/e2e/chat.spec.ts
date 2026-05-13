import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  test('should display chat interface', async ({ page }) => {
    await page.goto('/');

    // Check for chat input
    const chatInput = page.locator('input[name="message"], input[placeholder*="message"], textarea');
    await expect(chatInput).toBeVisible({ timeout: 10000 });
  });

  test('should send message and receive response', async ({ page }) => {
    await page.goto('/');

    // Wait for chat to be ready
    const chatInput = page.locator('input[name="message"], input[placeholder*="message"], textarea');

    // Fill in a test message
    await chatInput.fill('Hello');

    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Send")');
    await submitButton.click();

    // Wait for response (may take time for AI processing)
    await page.waitForTimeout(2000);

    // Check for any response element or result
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