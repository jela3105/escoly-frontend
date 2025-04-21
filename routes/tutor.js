const express = require('express');
const router = express.Router();
const { requiereLogin, soloRol } = require('../auth');

router.use(requiereLogin, soloRol(1));

router.get('/', (req, res) => {
    res.render('tutor/index', { user: req.session.user });
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

module.exports = router;