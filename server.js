
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Middleware para analisar o corpo da requisição como JSON
app.use(bodyParser.json());

// Substitua pelo seu token do bot
const TELEGRAM_BOT_TOKEN = '7045955625:AAGaTLknx9YYk3powiCXn_R6sIGOP8f3bcE';

// Endpoint para receber atualizações do bot
app.post(`/webhook/${TELEGRAM_BOT_TOKEN}`, (req, res) => {
  const message = req.body.message;

  if (message) {
    // Extrair o chat_id da mensagem
    const chatId = message.chat.id;
    console.log('Chat ID:', chatId);  // Exibe o chat_id no console

    // Enviar uma resposta para o Telegram
    const response = {
      method: 'sendMessage',
      chat_id: chatId,
      text: 'Olá! Recebemos sua mensagem.',
    };

    // Enviar a resposta de volta para o usuário via Telegram
    sendTelegramResponse(response);
  }

  res.sendStatus(200); // Retorna um status 200 de sucesso
});

// Função para enviar resposta para o Telegram
function sendTelegramResponse(response) {
  const https = require('https');
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${response.method}`;

  const data = JSON.stringify({
    chat_id: response.chat_id,
    text: response.text,
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Mensagem enviada para o Telegram:', data);
    });
  });

  req.write(data);
  req.end();
}

// Inicia o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
