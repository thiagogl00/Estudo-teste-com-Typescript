import express from 'express';

const app = express();
app.use(express.urlencoded({ extended: true }));


export function validarLogin(email: string, senha: string) {
  return email === 'thiago@gmail.com' && senha === '12345678';
}


export function paginaLogin() {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Login</title>

      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f2f2f2;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }

        .login {
          background: white;
          padding: 30px;
          border-radius: 10px;
          width: 300px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        h1 {
          text-align: center;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px;
          margin: 8px 0;
        }

        button {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        button:hover {
          background: #0056b3;
        }
      </style>
    </head>

    <body>
      <div class="login">
        <h1>Login</h1>

        <form method="POST" action="/login">
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            required
          />

          <input
            type="password"
            name="senha"
            placeholder="Senha"
            required
          />

          <button type="submit">
            Entrar
          </button>
        </form>
      </div>
    </body>
    </html>
  `;
}


export function paginaDashboard() {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Dashboard</title>

      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f5f5f5;
          text-align: center;
          padding-top: 100px;
        }

        #dashboard {
          background: white;
          display: inline-block;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
      </style>
    </head>

    <body>
      <div id="dashboard">
        <h1>Dashboard</h1>
        <p>Login realizado com sucesso!</p>
      </div>
    </body>
    </html>
  `;
}

export function mensagemLoginInvalido() {
  return `
    <h1>Login inválido</h1>
    <a href="/login">Voltar</a>
  `;
}


app.get('/login', (_req, res) => {
  res.send(paginaLogin());
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (validarLogin(email, senha)) {
    res.redirect('/dashboard');
    return;
  }

  res.status(401).send(mensagemLoginInvalido());
});

app.get('/dashboard', (_req, res) => {
  res.send(paginaDashboard());
});

app.get('/', (_req, res) => {
  res.redirect('/login');
});


export { app };