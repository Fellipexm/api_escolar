const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: '*', // Permitir acesso de qualquer origem
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'acesso123',
  database: 'web',
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conexão bem-sucedida ao banco de dados!');
  }
});

app.get('/', (req, res) => {
  res.send('Bem-vindo à API de Avaliação da Educação Básica!');
});

app.get('/escolas', (req, res) => {
  const { ano, idEscola, nomeEscola, tipoRede } = req.query;

  let sql = 'SELECT * FROM new WHERE 1';

  const conditions = [];

  if (ano) {
    conditions.push(`ano = ${ano}`);
  }

  if (idEscola) {
    conditions.push(`id_escola = ${idEscola}`);
  }

  if (nomeEscola) {
    conditions.push(`nome_escola LIKE '%${nomeEscola}%'`);
  }

  if (tipoRede) {
    conditions.push(`tipo_rede = '${tipoRede}'`);
  }

  if (conditions.length > 0) {
    sql += ` AND ${conditions.join(' AND ')}`;
  }

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).json({ error: 'Erro ao buscar as informações da tabela escola.' });
    } else {
      res.json(results);
    }
  });
});

// Substitua localhost pelo IP da sua máquina
const ipAddress = '172.16.31.43'; // Substitua pelo seu IP
app.listen(port, ipAddress, () => {
  console.log(`Servidor rodando em http://${ipAddress}:${port}`);
});
