// routes/admin.js
const express = require('express');
const router = express.Router();
const { requiereLogin, soloRol } = require('../auth');

router.use(requiereLogin, soloRol(3));

router.get('/', async (req, res) => {
    res.render('admin/index', { user: req.session.user });
});

router.get('/profesores', async (req, res) => {
    const teachersRes = await fetch('http://localhost:3000/admin/teachers', {
        headers: { Authorization: `Bearer ${req.session.token}` }
    });

    req.app.locals.teachers = await teachersRes.json();
    res.render('admin/profesoresAdministrar', { user: req.session.user, teachers: req.app.locals.teachers });
});

router.get('/grupos', async (req, res) => {
    res.render('admin/gruposAdministrar', { user: req.session.user });
});

router.get('/alumnos', async (req, res) => {
    res.render('admin/alumnosAdministrar', { user: req.session.user });
});

router.get('/password', async (req, res) => {
    res.render('admin/passwordAdmin', { user: req.session.user });
});

router.get('/soporte', async (req, res) => {
    res.render('admin/soporteAdmin', { user: req.session.user });
});

router.get('/nuevoProfesor', async (req, res) => {
    res.render('admin/nuevoProfesor', { user: req.session.user });
});

router.get('/editarProfesor', async (req, res) => {
    const teacherId = req.query.teacher;

    if (!req.app.locals.teachers || req.app.locals.teachers.length === 0) {
        const teachersRes = await fetch('http://localhost:3000/admin/teachers', {
            headers: { Authorization: `Bearer ${req.session.token}` }
        });
        req.app.locals.teachers = await teachersRes.json();
    }

    let teacher;
    for (teacher of req.app.locals.teachers) {
        if (teacher.id == teacherId) {
            break;
        }
    }

    res.render('admin/editarProfesor', { user: req.session.user, teacher });
});

router.get('/asignarAlumnos', async (req, res) => {
    res.render('admin/asignarAlumnos', { user: req.session.user });
});

router.get('/asignarProfesores', async (req, res) => {
    res.render('admin/asignarProfesores', { user: req.session.user });
});

router.get('/infoGrupos', async (req, res) => {
    res.render('admin/infoGrupos', { user: req.session.user });
});

router.get('/consultarAlumno', async (req, res) => {
    res.render('admin/consultarAlumno', { user: req.session.user });
});

router.get('/nuevoAlumno', async (req, res) => {
    res.render('admin/nuevoAlumno', { user: req.session.user });
});

router.post('/registrarProfesor', async (req, res) => {
    const { email, names, fathersLastName, mothersLastName } = req.body;


    const apiRes = await fetch('http://localhost:3000/admin/teachers/register', {
        method: 'POST',
        headers: { Authorization: `Bearer ${req.session.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, names, fathersLastName, mothersLastName })
    });

    const data = await apiRes.json();

    console.log(data.error);

    if (!apiRes.ok) return res.status(401).render('admin/nuevoProfesor', { user: req.session.user, error: data.error });

    res.redirect('/admin/profesores');
});

module.exports = router;
