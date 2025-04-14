function createTeacher() {
    document.getElementById('registrarProfesorForm').submit();
}

function savePassword() {
    document.getElementById('changePasswordForm').submit();
}

function createGroup() {
    document.getElementById('registrarGrupoForm').submit();
}

function addTutor() {
    const tutorName = document.getElementById('tutorName').value;
    const tutorLastName = document.getElementById('tutorLastName').value;
    const tutorSecondLastName = document.getElementById('tutorSecondLastName').value;
    const tutorEmail = document.getElementById('tutorEmail').value;

    if (!tutorName || !tutorLastName || !tutorEmail) {
        alert('Por favor, complete los campos obligatorios del tutor.');
        return;
    }

    const tutorsContainer = document.getElementById('tutorsContainer');
    const listItem = document.createElement('li');
    listItem.textContent = `Tutor: ${tutorName} ${tutorLastName} ${tutorSecondLastName} - ${tutorEmail}`;
    tutorsContainer.appendChild(listItem);

    // Clear input fields
    document.getElementById('tutorName').value = '';
    document.getElementById('tutorLastName').value = '';
    document.getElementById('tutorSecondLastName').value = '';
    document.getElementById('tutorEmail').value = '';
}

function saveStudent() {
    document.getElementById('registrarAlumnoForm').submit();
}