function createTeacher() {
    const names = document.getElementById('names').value;
    const fathersLastName = document.getElementById('fathersLastName').value;
    const mothersLastName = document.getElementById('mothersLastName').value;
    const email = document.getElementById('email').value;

    if (names == '' || fathersLastName == '' || mothersLastName == '' || email == '') {
        alert('Todos los campos son requeridos');
        return;
    }

    const teacher = {
        names: names,
        fathersLastName: fathersLastName,
        mothersLastName: mothersLastName,
        email: email
    }

    fetch('/admin/registrarProfesor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(teacher)
    })
}
