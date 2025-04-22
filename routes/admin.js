// routes/admin.js
const express = require('express');
const router = express.Router();
const { requiereLogin, soloRol } = require('../auth');

router.use(requiereLogin, soloRol(3));

router.get('/', async (req, res) => {
    res.render('admin/index', { user: req.session.user });
});

router.get('/profesores', async (req, res) => {
    const teachersRes = await fetch(`${process.env.API_URL}/admin/teachers`, {
        headers: { Authorization: `Bearer ${req.session.token}` }
    });

    req.app.locals.teachers = await teachersRes.json();
    res.render('admin/profesoresAdministrar', { user: req.session.user, teachers: req.app.locals.teachers });
});

router.get('/grupos', async (req, res) => {

    const groupsRes = await fetch(`${process.env.API_URL}/admin/groups`, {
        headers: { Authorization: `Bearer ${req.session.token}` }
    });

    res.app.locals.groups = await groupsRes.json();

    res.render('admin/gruposAdministrar', { user: req.session.user, groups: res.app.locals.groups });
});

router.get('/alumnos', async (req, res) => {
    res.render('admin/alumnosAdministrar', { user: req.session.user });
});

router.get('/password', async (req, res) => {
    res.render('admin/passwordAdmin', {
        user: req.session.user,
        formData: { currentPassword: '', newPassword: '', confirmNewPassword: '' }
    });
});

router.get('/soporte', async (req, res) => {
    res.render('admin/soporteAdmin', { user: req.session.user });
});

router.get('/nuevoProfesor', async (req, res) => {
    res.render('admin/nuevoProfesor', {
        user: req.session.user,
        formData: { names: '', fathersLastName: '', mothersLastName: '', email: '' }
    });
});

router.get('/editarProfesor', async (req, res) => {
    const teacherId = req.query.teacher;

    if (!req.app.locals.teachers || req.app.locals.teachers.length === 0) {
        const teachersRes = await fetch(`${process.env.API_URL}/admin/teachers`, {
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

router.get('/nuevoGrupo', async (req, res) => {
    res.render('admin/nuevoGrupo', {
        user: req.session.user,
        formData: { year: '', groupp: '' },
        errorMessage: undefined
    });
});

router.post('/registrarProfesor', async (req, res) => {
    const { email, names, fathersLastName, mothersLastName } = req.body;

    const apiRes = await fetch(`${process.env.API_URL}/admin/teachers/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${req.session.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, names, fathersLastName, mothersLastName })
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
        return res.status(401).render('admin/nuevoProfesor', {
            user: req.session.user,
            errorMessage: data.error || 'Error al registrar el profesor. Por favor, intente nuevamente.',
            formData: req.body
        });
    }

    res.redirect('/admin/profesores');
});



router.post('/registrarGrupo', async (req, res) => {
    const { year, name } = req.body;

    const apiRes = await fetch(`${process.env.API_URL}/admin/groups/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${req.session.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, name })
    });

    let data;
    try {
        // Intentar parsear la respuesta como JSON
        data = await apiRes.json();
    } catch (err) {
        // Si no es JSON, asignar un valor por defecto
        data = { error: 'Respuesta inesperada del servidor.' };
    }

    if (!apiRes.ok) {
        return res.status(401).render('admin/nuevoGrupo', {
            user: req.session.user,
            errorMessage: data.error || 'Error al registrar el grupo. Por favor, intente nuevamente.',
            formData: req.body
        });
    }

    res.redirect('/admin/grupos');
});

router.post('/registrarAlumno', async (req, res) => {
    const { studentName, studentLastName, studentSecondLastName, tutors } = req.body;

    const apiRes = await fetch(`${process.env.API_URL}/admin/students/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${req.session.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, studentLastName, studentSecondLastName, tutors })
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
        return res.status(401).render('admin/nuevoAlumno', {
            user: req.session.user,
            errorMessage: data.error || 'Error al registrar el alumno. Por favor, intente nuevamente.',
            formData: req.body
        });
    }

    res.redirect('/admin/alumnos');
});

router.post('/students/preregister', async (req, res) => {
    const { studentName, studentLastName, studentSecondLastName, tutors } = req.body;
    await Promise.all(tutors.map(async element => {
        const apiRes = await fetch(`${process.env.API_URL}/admin/guardian/register`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${req.session.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ names: element.name, fathersLastName: element.lastName, mothersLastName: element.secondLastName, email: element.email })
        });
        const data = await apiRes.json();
        console.log(data);
    }));
    let emails = [];
    tutors.forEach(async element => {
        emails.push(element.email);
    });
    console.log(emails);
    const apiRes = await fetch(`${process.env.API_URL}/admin/students/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${req.session.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: studentName, mothersLastName: studentLastName, fathersLastName: studentSecondLastName, guardians: emails })
    });
    const data = await apiRes.json();
    console.log(data);

    if (req.query.redirect === 'true') {
        return res.json({ redirectUrl: '/admin/alumnos' });
    }

    res.status(200).json({ message: 'Student preregistered successfully' });
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
        return res.status(401).render('admin/passwordAdmin', {
            user: req.session.user,
            errorMessage: data.error || 'Error al cambiar la contraseña. Por favor, intente mas tarde.'
        });
    }

    res.redirect('/admin');


});

router.post('/editarProfesor', async (req, res) => {
    const { email, names, fathersLastName, mothersLastName } = req.body;
    const teacherId = req.query.teacherId;

    console.log(req.body)

    const apiRes = await fetch(`${process.env.API_URL}/admin/users/${teacherId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${req.session.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, names, fathersLastName, mothersLastName })
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {

        let teacher;
        for (teacher of req.app.locals.teachers) {
            if (teacher.id == teacherId) {
                break;
            }
        }

        console.log(teacher)

        res.render('admin/editarProfesor', {
            user: req.session.user,
            errorMessage: data.error || 'Error al editar el profesor. Por favor, intente nuevamente.',
            teacher: { id: teacherId, names: names, fatherLastName: fathersLastName, motherLastName: mothersLastName, email: email }
        });

        return;
    }

    res.redirect('/admin/profesores');

});

module.exports = router;
