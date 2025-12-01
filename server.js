const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'parking.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('No se pudo abrir la base de datos SQLite:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      plate TEXT NOT NULL,
      document TEXT NOT NULL,
      received_at TEXT NOT NULL
    )`
  );
});

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(payload));
};

const server = http.createServer((req, res) => {
  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (method === 'POST' && url.pathname === '/api/registros') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.connection.destroy();
      }
    });

    req.on('end', () => {
      let data = {};
      if (body) {
        try {
          data = JSON.parse(body);
        } catch (error) {
          sendJson(res, 400, { error: 'Cuerpo JSON inválido.' });
          return;
        }
      }

      const { name, email, plate, id } = data;
      if (!name || !email || !plate || !id) {
        sendJson(res, 400, { error: 'Todos los campos son obligatorios.' });
        return;
      }

      const receivedAt = new Date().toISOString();

      db.run(
        'INSERT INTO registros (name, email, plate, document, received_at) VALUES (?, ?, ?, ?, ?)',
        [name, email, plate, id, receivedAt],
        function (err) {
          if (err) {
            console.error('Error al guardar en la base de datos:', err.message);
            sendJson(res, 500, { error: 'No se pudo guardar el registro.' });
            return;
          }

          const entry = {
            id: this.lastID,
            name,
            email,
            plate,
            document: id,
            receivedAt,
          };

          console.log('Registro recibido:', entry);
          sendJson(res, 201, {
            message: 'Registro recibido correctamente.',
            entry,
          });
        }
      );
    });

    return;
  }

  if (method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error al cargar la página.');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Ruta no encontrada.');
});

server.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
