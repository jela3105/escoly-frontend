// server.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

const adminRoutes = require('./routes/admin');
//const tutorRoutes = require('./routes/tutor');
//const profesorRoutes = require('./routes/profesor');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'clave-secreta',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Página de inicio/login
app.get('/', (req, res) => {
    res.render('login');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const apiRes = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await apiRes.json();

    if (!apiRes.ok) return res.status(401).render('login', { error: data.error });

    req.session.token = data.token;
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
//app.use('/tutor', tutorRoutes);
//app.use('/profesor', profesorRoutes);

app.listen(3001, () => {
    console.log('Servidor frontend en http://localhost:3000');
});
