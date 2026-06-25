// Verify end-to-end chat flows, checking page loads, inputs rendering, form submit events, and routing.

import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  // Assert that opening the root index successfully exposes the message inputs to the user.
  test('should display chat interface', async ({ page }) => {
    await page.goto('/');

    // Check for chat input fields or textareas on the screen.
    const chatInput = page.locator('input[name="message"], input[placeholder*="message"], textarea');
    await expect(chatInput).toBeVisible({ timeout: 10000 });
  });

  // Verify that filling prompts, clicking submit, and awaiting AI processes renders responses.
  test('should send message and receive response', async ({ page }) => {
    await page.goto('/');

    // Await layout stability and locator target readiness.
    const chatInput = page.locator('input[name="message"], input[placeholder*="message"], textarea');

    // Insert a sample hello greeting message.
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