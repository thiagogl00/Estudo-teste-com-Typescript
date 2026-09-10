import { expect, test } from '@playwright/test';
import {
  mensagemLoginInvalido,
  paginaDashboard,
  paginaLogin,
  validarLogin,
} from '../src/aula25/index.js';

test.describe('validarLogin', () => {
  test('aceita credenciais válidas', () => {
    expect(validarLogin('thiago@gmail.com', '12345678')).toBe(true);
  });

  test('rejeita senha inválida', () => {
    expect(validarLogin('thiago@gmail.com', '123')).toBe(false);
  });

  test('rejeita e-mail inválido', () => {
    expect(validarLogin('user@gmail.com', '12345678')).toBe(false);
  });
});

test.describe('páginas HTML', () => {
  test('gera formulário de login com campos obrigatórios', async ({ page }) => {
    await page.setContent(paginaLogin());

    await expect(page).toHaveTitle('Login');
    await expect(page.locator('form')).toHaveAttribute('method', 'POST');
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="senha"]')).toHaveAttribute('required', '');
    await expect(page.locator('button[type="submit"]')).toHaveText('Entrar');
  });

  test('gera dashboard de login realizado', async ({ page }) => {
    await page.setContent(paginaDashboard());

    await expect(page.locator('#dashboard')).toContainText('Dashboard');
    await expect(page.locator('#dashboard')).toContainText('Login realizado com sucesso!');
  });

  test('gera mensagem de login inválido com retorno', async ({ page }) => {
    await page.setContent(mensagemLoginInvalido());

    await expect(page.getByRole('heading', { name: 'Login inválido' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/login');
  });
});