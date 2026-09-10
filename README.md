# Testes com Playwright e TypeScript

O projeto apresenta três níveis de teste:

- **Unitário:** verifica funções isoladas, sem depender de um servidor HTTP.
- **Integração:** verifica a comunicação entre as rotas Express, a regra de autenticação e as respostas HTTP.
- **E2E (end-to-end):** simula a jornada de uma pessoa usando a aplicação pelo navegador.

## Pré-requisitos

- Node.js 18 ou superior
- npm
- Um terminal e um editor compatível com TypeScript

Confira as versões instaladas:

```bash
node --version
npm --version
```

## Instalação

Na raiz do projeto, instale as dependências:

```bash
npm install
```

Depois, instale os navegadores usados pelo Playwright:

```bash
npx playwright install
```

Em distribuições Linux, caso faltem bibliotecas do sistema, use:

```bash
npx playwright install --with-deps
```

## Executando a aplicação

Para iniciar o servidor Express em modo de desenvolvimento:

```bash
npm run dev:server
```

A aplicação ficará disponível em [http://localhost:3000/login](http://localhost:3000/login).

Também existe o comando `npm run dev`, que executa o type-check antes de iniciar o servidor. Para gerar JavaScript em `dist/` e executar a versão compilada:

```bash
npm run build
npm start
```

O servidor possui estas rotas:

| Método | Rota | Comportamento |
| --- | --- | --- |
| `GET` | `/` | Redireciona para `/login` |
| `GET` | `/login` | Exibe o formulário de login |
| `POST` | `/login` | Autentica o usuário ou retorna `401` |
| `GET` | `/dashboard` | Exibe o dashboard |

As credenciais válidas do exemplo são:

```text
E-mail: thiago@gmail.com
Senha: 12345678
```

## Executando os testes

O comando geral executa todos os arquivos de teste:

```bash
npm test
```

Para executar um nível específico:

```bash
npm run test:unit
npm run test:inte
npm run test:e2e
```

Os scripts acima correspondem, respectivamente, a:

| Script | Arquivo | Objetivo |
| --- | --- | --- |
| `test:unit` | `tests/unit.spec.ts` | Testar a regra de login e os geradores de HTML |
| `test:inte` | `tests/integration.spec.ts` | Testar as rotas e o contrato HTTP da aplicação |
| `test:e2e` | `tests/example.spec.ts` | Testar o login completo pelo navegador |

Use `npm run` antes do nome do script. Por exemplo, `npm run test:unit` é válido; `npm test:unit` não é um script npm válido.

Não é necessário iniciar o servidor manualmente para rodar os testes. O arquivo `playwright.config.ts` usa `webServer` para executar `npm run dev:server` antes da suíte e espera a URL `http://localhost:3000/login` ficar disponível. Quando o servidor já está rodando, ele pode ser reutilizado fora do CI.

### Opções úteis do Playwright

Executar um arquivo diretamente:

```bash
npx playwright test tests/integration.spec.ts
```

Executar somente um projeto de navegador:

```bash
npx playwright test --project=chromium
```

Abrir o navegador durante a execução:

```bash
npx playwright test tests/example.spec.ts --headed
```

Abrir a interface interativa do Playwright:

```bash
npx playwright test --ui
```

Executar o verificador de tipos:

```bash
npm run type-check
```

## Os três níveis de teste

### 1. Testes unitários: testar uma unidade isolada

O arquivo `tests/unit.spec.ts` importa diretamente as funções exportadas por `src/aula25/index.ts`:

- `validarLogin(email, senha)` retorna `true` para a combinação correta e `false` para dados inválidos.
- `paginaLogin()` gera o HTML do formulário.
- `paginaDashboard()` gera o HTML da página após o login.
- `mensagemLoginInvalido()` gera a resposta para uma tentativa rejeitada.

As funções são testadas sem abrir uma conexão com o servidor e sem passar pelas rotas Express. Para validar o HTML, o teste usa `page.setContent()`, carregando o resultado da função em uma página isolada. Assim, é possível usar os localizadores e asserções do Playwright sem transformar esse teste em um teste de rota.

Esse arquivo responde perguntas como:

- A regra aceita exatamente o e-mail e a senha esperados?
- Uma senha ou um e-mail incorreto são rejeitados?
- A função de login gera um formulário com os campos obrigatórios?
- A função de dashboard gera o título e a mensagem esperados?

O teste unitário não confirma que o Express está ouvindo na porta 3000. Essa responsabilidade pertence aos testes de integração e E2E.

Exemplo do padrão usado:

```ts
expect(validarLogin('thiago@gmail.com', '12345678')).toBe(true);

await page.setContent(paginaLogin());
await expect(page).toHaveTitle('Login');
```

### 2. Testes de integração

O arquivo `tests/integration.spec.ts` acessa a aplicação real por meio da `baseURL` configurada. Ele verifica se as partes trabalham juntas corretamente:

- `GET /` redireciona para `/login`.
- O formulário possui método, ação, campos e botão esperados.
- Um login válido redireciona para `/dashboard` e exibe o conteúdo correto.
- Credenciais inválidas retornam status HTTP `401` e a mensagem `Login inválido`.
- O dashboard pode ser consultado diretamente.

Há dois tipos de fixture nesse arquivo:

- `page`: testa a aplicação como uma página de navegador.
- `request`: envia uma requisição HTTP diretamente, útil para verificar status e corpo da resposta sem depender da interface.

Essa combinação ensina a diferenciar um teste visual/de fluxo de uma verificação direta do contrato HTTP.

O caminho feliz usa `page` porque o objetivo é observar o comportamento da página depois do redirecionamento. O cenário inválido usa `request` porque o objetivo é verificar diretamente o contrato HTTP: o servidor deve responder com status `401` e um corpo contendo `Login inválido`. Uma resposta `401` é esperada nesse caso, portanto ela não deve ser validada com `toBeOK()`, que só considera respostas bem-sucedidas.

### 3. Testes E2E

O arquivo `tests/example.spec.ts` representa a jornada completa de uma pessoa:

1. Acessa `/login`.
2. Preenche o e-mail.
3. Preenche a senha.
4. Clica em `Entrar`.
5. Confirma que o dashboard ficou visível.

O arquivo também cobre as jornadas de senha inválida e e-mail inválido. Diferentemente do teste unitário, aqui a interação passa pelo formulário, pelo navegador, pela requisição `POST /login`, pela regra de autenticação e pelo redirecionamento para o dashboard.

Os testes E2E usam a mesma sequência geral:

```ts
await page.goto('/login');
await page.fill('input[name="email"]', 'thiago@gmail.com');
await page.fill('input[name="senha"]', '12345678');
await page.click('button[type="submit"]');
await expect(page.locator('#dashboard')).toBeVisible();
```

Nesse nível, o teste não importa `validarLogin()` nem chama `app` diretamente. Isso é intencional: a jornada deve ser exercitada através da interface pública da aplicação.

## Como escolher o tipo de teste

| Pergunta | Tipo recomendado | Arquivo deste projeto |
| --- | --- | --- |
| A função produz o resultado correto? | Unitário | `tests/unit.spec.ts` |
| As rotas, o parser do formulário e as respostas HTTP trabalham juntos? | Integração | `tests/integration.spec.ts` |
| Uma pessoa consegue concluir o login pela tela? | E2E | `tests/example.spec.ts` |

Uma boa suíte combina os três níveis. Os testes unitários são rápidos e localizam falhas na regra; os de integração protegem o contrato do servidor; os E2E validam o fluxo que tem valor para quem usa a aplicação.

## Configuração do Playwright

O arquivo `playwright.config.ts` define:

- `testDir: './tests'`: localização dos testes.
- `baseURL: 'http://localhost:3000'`: permite usar caminhos como `page.goto('/login')`.
- `webServer`: inicia automaticamente o Express.
- `reporter: 'html'`: gera um relatório navegável.
- projetos `chromium` e `firefox`: executam a suíte nos dois navegadores.
- `trace: 'on-first-retry'`: coleta um trace na primeira repetição de um teste, ajudando a investigar falhas em ambientes de CI.

Por padrão, a execução pode apresentar cada teste em mais de um navegador. Isso aumenta a confiança no comportamento cross-browser, mas também aumenta o tempo total da suíte.

## Relatórios e diagnóstico

Após executar os testes, abra o relatório HTML com:

```bash
npx playwright show-report
```

O relatório mostra testes aprovados e falhos, duração, navegador, mensagens de erro e artefatos disponíveis. Quando houver trace, ele pode ser aberto pelo próprio relatório para acompanhar cada ação e estado da página.

Para uma investigação rápida, execute um teste específico com saída detalhada:

```bash
npx playwright test tests/integration.spec.ts --project=chromium --reporter=line
```

## Organização do projeto

```text
.
├── src/
│   └── aula25/
│       ├── index.ts              # Regra de login, páginas HTML e rotas Express
│       └── server.ts             # Inicialização do servidor na porta 3000
├── tests/
│   ├── unit.spec.ts              # Testes unitários
│   ├── integration.spec.ts       # Testes de integração
│   └── example.spec.ts           # Testes E2E
├── playwright.config.ts          # Configuração do Playwright
├── tsconfig.json                 # Configuração do TypeScript
└── package.json                  # Dependências e scripts
```

O `tsconfig.json` compila apenas o código de `src/`; os arquivos de teste são executados pelo Playwright com suporte a TypeScript. Por isso, `npm run type-check` verifica a aplicação, enquanto `npm test` executa a suíte pelo Playwright.
