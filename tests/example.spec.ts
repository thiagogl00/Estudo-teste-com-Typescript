import { test, expect } from '@playwright/test';

test('deve realizar login com sucesso',async ({page})=>{
  await page.goto('/login');
  
  await page.fill('input[name="email"]','thiago@gmail.com');
  await page.fill('input[name="senha"]','12345678');

  await page.click('button[type="submit"]');

  await expect(page.locator('#dashboard')).toBeVisible();
}); 

test('deve rejeitar senha inválida', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[name="email"]', 'thiago@gmail.com');
  await page.fill('input[name="senha"]', '123');

  await page.click('button[type="submit"]');

  await expect(page.getByText('Login inválido')).toBeVisible();
});

test('deve rejeitar email inválido', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[name="email"]', 'user@gmail.com');
  await page.fill('input[name="senha"]', '12345678');

  await page.click('button[type="submit"]');

  await expect(page.getByText('Login inválido')).toBeVisible();
});
