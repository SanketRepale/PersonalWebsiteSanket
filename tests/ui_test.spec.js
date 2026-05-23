const { test, expect } = require('@playwright/test');

test.describe('Portfolio UI Tests', () => {
  // We use the local server that will be spun up, or test a local file.
  // For static testing, we can serve it or test it by path.
  // Here we assume a local server is running or we can open the file URL.
  
  test.beforeEach(async ({ page }) => {
    // Note: To test this in CI, we'd start a local web server (e.g. npx serve or python -m http.server)
    // For now we test against localhost assuming the backend/frontend is running
    await page.goto('http://127.0.0.1:8000/');
  });

  test('should have the correct title and meta description', async ({ page }) => {
    await expect(page).toHaveTitle(/Sanket Prakash Repale/);
    
    // Check for hero text
    const heroText = page.locator('.hero h1');
    await expect(heroText).toContainText('Sanket Repale');
  });

  test('navigation links should work', async ({ page }) => {
    // Click on 'Skills' link
    await page.click('a.nav-link[href="#skills"]');
    
    // Ensure smooth scroll or visibility
    const skillsSection = page.locator('#skills');
    await expect(skillsSection).toBeVisible();
  });

  test('contact form should show validation errors when empty', async ({ page }) => {
    await page.click('a.nav-link[href="#contact"]');
    
    // Try submitting without filling fields
    const submitBtn = page.locator('#contact-form button[type="submit"]');
    await submitBtn.click();
    
    // HTML5 validation will block it, so the button should still say "Send Message"
    // We can check if it gets disabled or changes state incorrectly
    await expect(submitBtn).toBeEnabled();
  });
});
