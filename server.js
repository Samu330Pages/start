const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar las rutas estáticas
app.use(express.static(path.join(__dirname, 'public')));

// Configurar la ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'yt.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`La aplicación está corriendo en http://localhost:${PORT}`);
});