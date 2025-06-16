document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });
    try {

        const res = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });


        const data = await res.json();

        if (!res.ok) throw new Error('Login fallido');

        const token = data.token;

        // Solicita el HTML protegido al servidor Express local
        const htmlRes = await fetch('/admin', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!htmlRes.ok) throw new Error('Acceso no autorizado');

        const html = await htmlRes.text();

        // Carga el HTML manualmente y guarda el token en memoria
        document.open();
        document.write(`< script > window.token = '${token}' <\/script>` + html);
        document.close();
    } catch (err) {
        alert(err.message);
    }
});
