import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/login');
});

test.describe('Testing Login', () => {
    test('Debería iniciar sesión correctamente', async ({ page }) => {
        await page.fill('input[name="username"]', 'testuser');
        await page.fill('input[name="password"]', 'testpassword');
        
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL('http://localhost:4200/posts');
    });

    test('Credenciales Incorrectas', async ({ page }) => {
        await page.fill('input[name="username"]', 'testuser');
        await page.fill('input[name="password"]', '1231231231');

        await page.click('button[type="submit"]');

        await expect(page.locator('text="Invalid credentials"')).toBeVisible();
    });

    test('Datos Vacios', async ({ page }) => {
        await page.fill('input[name="username"]', '');
        await page.fill('input[name="password"]', '');

        await page.click('button[type="submit"]');

        const error = await page.locator('text="String must contain at least 3 character(s)"').isVisible();
        const error2 = await page.locator('text="String must contain at least 8 character(s)"').isVisible();

        await expect(error).toBeTruthy();
        await expect(error2).toBeTruthy();
    });
});