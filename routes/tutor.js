const express = require('express');
const router = express.Router();
const { requiereLogin, soloRol } = require('../auth');

router.use(requiereLogin, soloRol(1));

router.get('/', async (req, res) => {

    const apiRes = await fetch(`${process.env.API_URL}/guardian/students`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${req.session.token}`, 'Content-Type': 'application/json' },
    })

    const students = await apiRes.json();

    console.log(students)

    res.render('tutor/index', {
        user: req.session.user,
        mapsApiKey: process.env.MAPS_API_KEY,
        students
    });
});

router.get('/students', async (req, res) => {
    const apiRes = await fetch(`${process.env.API_URL}/guardian/students`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${req.session.token}`, 'Content-Type': 'application/json' },
    })

    const students = await apiRes.json();

    res.status(200).json({
        students
    });
});


router.get('/password', (req, res) => {
    res.render('tutor/password', {
        user: req.session.user,
        formData: { currentPassword: '', newPassword: '', confirmNewPassword: '' }
    });
});

router.get('/soporte', (req, res) => {
    res.render('tutor/soporte', { user: req.session.user });
});

router.post('/changePassword', async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
        return res.status(400).render('admin/passwordAdmin', {
            user: req.session.user,
            formData: req.body,
            errorMessage: 'Las contraseñas nuevas no coinciden.'
        });
    }

    const apiRes = await fetch(`${process.env.API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${req.session.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
        return res.status(401).render('tutor/password', {
            user: req.session.user,
            errorMessage: data.error || 'Error al cambiar la contraseña. Por favor, intente mas tarde.'
        });
    }

    res.redirect('/tutor');

});

module.exports = router;