// routes/admin.js
const express = require('express');
const router = express.Router();
const { requiereLogin, soloRol } = require('../auth');

router.use(requiereLogin, soloRol(3));

router.get('/', async (req, res) => {
    const teachersRes = await fetch('http://localhost:3000/admin/teachers', {
        headers: { Authorization: `Bearer ${req.session.token}` }
    });

    const teachers = await teachersRes.json();
    res.render('admin', { user: req.session.user, teachers });
});

module.exports = router;
