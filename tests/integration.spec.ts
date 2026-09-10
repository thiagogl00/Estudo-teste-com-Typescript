import { expect, test } from '@playwright/test';

test.describe('integração do fluxo de autenticação', () => {
  test('redireciona a raiz para a página de login', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('exibe o contrato esperado do formulário de login', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle('Login');
    
    const form = page.locator('form');
    
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form).toHaveAttribute('action', '/login');
    await expect(page.getByPlaceholder('E-mail')).toHaveAttribute('type', 'email');
    await expect(page.getByPlaceholder('Senha')).toHaveAttribute('type', 'password');
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('autentica o usuário e redireciona para o dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('E-mail').fill('thiago@gmail.com');
    await page.getByPlaceholder('Senha').fill('12345678');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.locator('#dashboard')).toContainText(
      'Login realizado com sucesso!',
    );
  });

  test('retorna HTTP 401 e mensagem para credenciais inválidas', async ({ request }) => {
    const response = await request.post('/login', {
      form: {
        email: 'thiago@gmail.com',
        senha: 'senha-incorreta',
      },
    });

    expect(response.status()).toBe(401);
    expect(response).not.toBeOK();
    
    const body = await response.text();
    expect(body).toMatch(/Login inválido/);
  });

  test('permite consultar o dashboard diretamente', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveTitle('Dashboard');
    await expect(page.locator('#dashboard')).toContainText('Dashboard');
  });
});