const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Define a pasta de arquivos públicos
app.use(express.static(path.join(__dirname, 'public')));

// Rota inicial: abre o loginormal.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loginormal.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
})