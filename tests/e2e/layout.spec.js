import { test, expect } from '@playwright/test';

test.describe('Layout Checks', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        // Dismiss Daily Welcome if present
        const welcome = page.getByText('Ave Keizer');
        if (await welcome.isVisible()) {
            await welcome.click();
        }
    });

    test('should display correct title', async ({ page }) => {
        await expect(page).toHaveTitle(/Forum Emergo/);
    });

    test('should show Hero Banner', async ({ page }) => {
        const banner = page.locator('.hero-banner');
        await expect(banner).toBeVisible();
        await expect(page.locator('.hero-banner h1')).toHaveText('Forum Emergo');
    });

    test('should display Bottom Navigation on all devices', async ({ page }) => {
        const bottomNav = page.locator('.bottom-nav');
        await expect(bottomNav).toBeVisible();

        // Check standard buttons (English defaults), allowing for dynamic Player Name prefix
        // Check Tab 1: Duties / City of Player
        // We look for the first button which usually acts as the Duties/Home tab
        await expect(bottomNav.locator('button').nth(0)).toBeVisible();

        // Check Tab 2: Stad (formerly Tavern)
        // explicitly look for 'Stad' which we just renamed
        await expect(bottomNav.getByAltText('Stad')).toBeVisible();

        // Check Tab 3: Adventure
        await expect(bottomNav.getByAltText(/Adventure|Avontuur/i)).toBeVisible();
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

    test('should navigate to Stad and back', async ({ page }) => {
        // Go to Stad (formerly Tavern tab)
        await page.getByTitle('Stad').click();

        // Assert we are in CapitalView
        // CapitalView has a header with "Stad" and resources (now in overlay-top)
        await expect(page.locator('.capital-overlay-top').getByText('Stad')).toBeVisible();
        await expect(page.getByText('🪙')).toBeVisible();

        // Go back to Duties (First tab, now named "Taken en plichten")
        await page.getByTitle('Taken en plichten').click();

        // Header might also be dynamic now (Player Name badge) or fallback to something else
        // In CityView (Tasks view), we verify columns are visible
        await expect(page.locator('.city-columns-container')).toBeVisible();
    });
});
