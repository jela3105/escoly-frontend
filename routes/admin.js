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

    const teachers = await teachersRes.json();
    res.render('admin/profesoresAdministrar', { user: req.session.user, teachers });
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

module.exports = router;
