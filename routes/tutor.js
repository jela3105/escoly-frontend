const express = require('express');
const router = express.Router();
const { requiereLogin, soloRol } = require('../auth');

router.use(requiereLogin, soloRol(1));

router.get('/', async (req, res) => {
    res.render('tutor/index', { user: req.session.user });
});

module.exports = router;