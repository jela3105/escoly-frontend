function createTeacher() {
    document.getElementById('registrarProfesorForm').submit();
}

function savePassword() {
    document.getElementById('changePasswordForm').submit();
}

function createGroup() {
    document.getElementById('registrarGrupoForm').submit();
}

let tutors = []; // Array to store tutor data

function addTutor() {
    const tutorName = document.getElementById('tutorName').value;
    const tutorLastName = document.getElementById('tutorLastName').value;
    const tutorSecondLastName = document.getElementById('tutorSecondLastName').value;
    const tutorEmail = document.getElementById('tutorEmail').value;

    if (!tutorName || !tutorLastName || !tutorEmail) {
        alert('Por favor, complete los campos obligatorios del tutor.');
        return;
    }

    // Add tutor to the array
    tutors.push({
        name: tutorName,
        lastName: tutorLastName,
        secondLastName: tutorSecondLastName,
        email: tutorEmail
    });

    // Display tutor in the list
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

async function saveStudent() {
    const studentName = document.getElementById('names').value;
    const studentLastName = document.getElementById('fathersLastName').value;
    const studentSecondLastName = document.getElementById('mothersLastName').value;

    if (!studentName || !studentLastName || !studentSecondLastName) {
        alert('Por favor, complete los campos obligatorios del alumno.');
        return;
    }

    // Prepare data for POST request
    const data = {
        studentName,
        studentLastName,
        studentSecondLastName,
        tutors
    };
    const apiRes = await fetch(`http://localhost:3001/admin/students/preregister?redirect=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const response = await apiRes.json();
    if (response.redirectUrl) {
        window.location.href = response.redirectUrl;
    } else {
        console.log(response.message);
    }
}