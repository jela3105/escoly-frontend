// server.js
const express = require('express');
const path = require('path');
const app = express();

const PORT = 3001;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autorización para proteger rutas
function protectHtml(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) {
        return res.status(401).send('No autorizado');
    }
    next();
}

// Ruta protegida
app.get('/admin', protectHtml, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin', 'admin.html'));
});

// Redirección por defecto al login
app.get('/', (req, res) => {
    console.log('Redireccionando a login.html');
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

// Iniciar el servidor con manejo de errores
const server = app.listen(PORT, () => {
    console.log(`Servidor frontend en http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} ya está en uso. Por favor, usa otro puerto.`);
    } else {
        console.error('Error al iniciar el servidor:', err);
    }
    process.exit(1);
});

// Manejar señales de terminación
process.on('SIGTERM', () => {
    console.log('Recibida señal SIGTERM. Cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Recibida señal SIGINT. Cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado.');
        process.exit(0);
    });
});
