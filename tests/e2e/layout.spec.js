import { test, expect } from '@playwright/test';

test.describe('Layout Checks', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
    });

    test('should display correct title', async ({ page }) => {
        await expect(page).toHaveTitle(/Forum Emergo/);
    });

    test('should show Hero Banner', async ({ page }) => {
        const banner = page.locator('.hero-banner');
        await expect(banner).toBeVisible();
        await expect(page.locator('h1')).toHaveText('Forum Emergo');
    });

    test('should display Bottom Navigation on all devices', async ({ page }) => {
        const bottomNav = page.locator('.bottom-nav');
        await expect(bottomNav).toBeVisible();

        // Check standard buttons (English defaults), allowing for dynamic Player Name prefix
        await expect(bottomNav.getByAltText(/Duties|City|Stad/i)).toBeVisible();
        await expect(bottomNav.getByAltText('Tavern')).toBeVisible();
        await expect(bottomNav.getByAltText('Adventure')).toBeVisible();
    });

    test('should show City Visual overview', async ({ page }) => {
        await expect(page.locator('.city-columns-container')).toBeVisible();
        // Check for the three columns (Column headers are hardcoded or translated? 
        // In CityView they are: Virtue -> 'Virtutes', Vice -> 'Barbaria', Todo -> 'Mandata'
        // These are hardcoded in CityView.jsx lines 46. So they work!
        await expect(page.getByText('Virtutes')).toBeVisible();
        await expect(page.getByText('Barbaria')).toBeVisible();
        await expect(page.getByText('Mandata')).toBeVisible();
    });

    test('should navigate to Tavern and back', async ({ page }) => {
        // Go to Tavern
        await page.getByTitle('Tavern').click();
        await expect(page.locator('h2').getByText('De Vergulde Gladius')).toBeVisible(); // This substring is hardcoded in TavernView

        // Go back to City
        await page.getByTitle(/Duties|City|Stad/i).click();
        // Header might also be dynamic now (Player Name badge)
        await expect(page.locator('.city-name-badge')).toBeVisible();
    });
});
