const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: '*', 
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

app.get('/dados', (req, res) => {
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

app.get('/dados/comparacao', (req, res) => {
  const { escola1, escola2, ano } = req.query;

  if (!escola1 || !escola2 || !ano) {
    res.status(400).json({ error: 'Parâmetros inválidos.' });
    return;
  }

  let sql = `
    SELECT id_escola, nome_escola, nota_media_padronizada as nota
    FROM new
    WHERE ano = ${ano}
        AND (id_escola = ${escola1} OR id_escola = ${escola2})
  `;

  console.log('Consulta SQL:', sql);

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).json({ error: 'Erro ao comparar as escolas.', details: err.message });
    } else {
      if (results.length < 2) {
        res.json({ resultado: 'empate' });
      } else {
        const melhorEscola = results.reduce((melhor, escola) => {
          return escola.nota > melhor.nota ? escola : melhor;
        });

        res.json({ resultado: melhorEscola });
      }
    }
  });
});


app.get('/dados/media-padronizada', (req, res) => {
  connection.query('SELECT id_escola, nome_escola, nota_saeb_media_padronizada FROM new', (err, results) => {
    if (err) {
      console.error('Erro ao executar a consulta para Nota Média Padronizada:', err);
      res.status(500).json({ error: 'Erro ao buscar a Nota Média Padronizada.', details: err.message });
    } else {
      console.log('Resultado da consulta para Nota Média Padronizada:', results);
      res.json(results);
    }
  });
});

const ipAddress = '172.16.31.43';
app.listen(port, ipAddress, () => {
  console.log(`Servidor rodando em http://${ipAddress}:${port}`);
});
