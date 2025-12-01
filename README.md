# pishing

Formulario de registro para parqueadero con un backend mínimo en Node.js que recibe, valida y almacena los registros en SQLite.

## Uso local

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor local:
   ```bash
   npm start
   ```
3. Abre http://localhost:3000 para usar el formulario. El backend expone `POST /api/registros` para recibir `name`, `email`, `plate` y `id` en JSON y guarda los datos en `data/parking.db`.

## Ejecutar con Docker Compose (producción)

1. Construye la imagen y levanta el servicio en segundo plano (sin bloquear la consola):
   ```bash
   docker compose up -d --build
   ```
2. Abre http://localhost:3000 para acceder al frontend y backend juntos.
3. Los datos se guardan en un volumen nombrado `parking_data` (persistente entre reinicios).
4. Para detener los servicios y conservar los datos:
   ```bash
   docker compose down
   ```
5. Para eliminar también el volumen (y los registros almacenados):
   ```bash
   docker compose down -v
   ```
