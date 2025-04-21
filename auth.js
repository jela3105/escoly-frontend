// auth.js
module.exports = {
    requiereLogin: (req, res, next) => {
        if (!req.session.token || !req.session.user) {
            return res.redirect('/');
        }

        const tiempoTranscurrido = Date.now() - req.session.horaLogin;
        if (tiempoTranscurrido > 29 * 60 * 1000) { // El token expira en 30 minutos, asi que se debe validar
            req.session.destroy();
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
