// auth.js
module.exports = {
    requiereLogin: (req, res, next) => {
        if (!req.session.token || !req.session.user) {
            return res.redirect('/');
        }
        next();
    },
    soloRol: (rol) => {
        return (req, res, next) => {
            if (req.session.user?.role !== rol) {
                return res.status(403).send('Acceso denegado');
            }
            next();
        };
    }
};
