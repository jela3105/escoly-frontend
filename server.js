// server.js
const express = require('express');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const { io: ClientIO } = require('socket.io-client');
const path = require('path');

const app = express();
const server = http.createServer(app);

require('dotenv').config()

const adminRoutes = require('./routes/admin');
const tutorRoutes = require('./routes/tutor');
//const profesorRoutes = require('./routes/profesor');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sessionMiddleware = session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax'
    }
})
app.use(sessionMiddleware);

// Página de inicio/login
app.get('/', (req, res) => {
    res.render('login');
});


// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const apiRes = await fetch(`${process.env.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await apiRes.json();

    if (!apiRes.ok) return res.status(401).render('login', { error: data.error });

    req.session.token = data.token;
    req.session.horaLogin = Date.now();
    req.session.user = data.user; // Supone que el backend regresa info del usuario con rol

    // Redirige según rol
    const rol = data.user.role;
    if (rol === 3) return res.redirect('/admin');
    if (rol === 2) return res.redirect('/profesor');
    if (rol === 1) return res.redirect('/tutor');

    res.redirect('/');
});

// Rutas protegidas
app.use('/admin', adminRoutes);
app.use('/tutor', tutorRoutes);
//app.use('/profesor', profesorRoutes);

// Inicializar socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true
    }
});

// Adaptar sesiones a sockets
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// Proxy de conexión al backend
io.on('connection', (clientSocket) => {
    const req = clientSocket.request;
    const token = req.session.token;

    if (!token) {
        return clientSocket.disconnect(true);
    }

    const backendSocket = ClientIO(process.env.API_URL, {
        auth: { token }
    });

    // Relay de mensajes
    clientSocket.on('subscribe-guardian', () => {
        backendSocket.emit('subscribe-guardian', token);
    });

    backendSocket.on('location-update', (data) => {
        clientSocket.emit('location-update', data);
    });

    clientSocket.on('disconnect', () => {
        backendSocket.disconnect();
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log('Servidor frontend en http://localhost:3001');
});
