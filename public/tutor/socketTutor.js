const maps = {}; // Objeto para almacenar referencias a mapas y marcadores por deviceId
const timeDifferences = []; // Array para almacenar las diferencias de tiempo

// Referencias a elementos del DOM
const openModalBtn = document.getElementById('openModalBtn');
const locationModal = document.getElementById('locationModal');
const closeButton = document.querySelector('.close-button');
const locationButtonsContainer = document.getElementById('locationButtons');
const rangeInput = document.getElementById('myRange');
const rangeValueSpan = document.getElementById('rangeValue');

let map; // Variable global para el mapa
let marker; // Variable global para el marcador

// Datos de ejemplo para las ubicaciones
const locations = [
    { name: "Casa 1", lat: 19.432608, lng: -99.133209 },
    { name: "Casa 2", lat: 20.659800, lng: -103.349800 },
];

// --- Funcionalidad del Modal ---
openModalBtn.addEventListener('click', () => {
    locationModal.style.display = 'flex'; // Usar flex para centrar el contenido
    // Asegurarse de que el mapa se inicialice o se redibuje correctamente al abrir el modal
    if (map) {
        google.maps.event.trigger(map, 'resize');
        // Centrar el mapa en la primera ubicación al abrir
        if (locations.length > 0) {
            map.setCenter({ lat: locations[0].lat, lng: locations[0].lng });
            if (marker) {
                marker.setPosition({ lat: locations[0].lat, lng: locations[0].lng });
            } else {
                marker = new google.maps.Marker({
                    position: { lat: locations[0].lat, lng: locations[0].lng },
                    map: map,
                    title: locations[0].name
                });
            }
        }
    } else {
        // Si el mapa aún no se ha inicializado, esto lo hará.
        // La función initMap es llamada por el script de la API de Google Maps.
    }
});

closeButton.addEventListener('click', () => {
    locationModal.style.display = 'none';
});

// Cerrar el modal haciendo clic fuera de él
window.addEventListener('click', (event) => {
    if (event.target == locationModal) {
        locationModal.style.display = 'none';
    }
});

// --- Inicialización del Mapa ---
function initModalMap() {
    // Coordenadas iniciales (por ejemplo, Ciudad de México)
    const initialLatLng = { lat: 19.432608, lng: -99.133209 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 18,
        center: initialLatLng,
    });

    // Crea el marcador inicial
    marker = new google.maps.Marker({
        position: initialLatLng,
        map: map,
        title: "Ubicación Actual"
    });

    // Generar botones de ubicación después de que el mapa esté listo
    createLocationButtons();
}

// --- Generación de Botones de Ubicación ---
function createLocationButtons() {
    locations.forEach(location => {
        const button = document.createElement('button');
        button.classList.add('location-button');
        button.textContent = location.name;
        button.dataset.lat = location.lat;
        button.dataset.lng = location.lng;

        button.addEventListener('click', () => {
            const lat = parseFloat(button.dataset.lat);
            const lng = parseFloat(button.dataset.lng);
            const newLatLng = { lat: lat, lng: lng };

            // Mueve el mapa al nuevo centro
            map.setCenter(newLatLng);

            // Actualiza la posición del marcador
            marker.setPosition(newLatLng);
            marker.setTitle(location.name); // Actualiza el título del marcador
        });
        locationButtonsContainer.appendChild(button);
    });
}

// --- Barra de Rango ---
rangeInput.addEventListener('input', () => {
    rangeValueSpan.textContent = rangeInput.value;
});

// Asegurarse de que el mapa se inicialice incluso si el modal no se abre de inmediato (aunque initMap se llama por el script de la API)
// Esto es más un respaldo o si no estás usando el callback en la URL de la API.
// window.onload = initMap; // Esto podría causar un doble intento si ya usas callback=initMap

function calculateAverageTimeDifference() {
    if (timeDifferences.length === 0) return;

    const sum = timeDifferences.reduce((acc, diff) => acc + diff, 0);
    const average = sum / timeDifferences.length;
    console.log(`Promedio de diferencia de tiempo (ms): ${average}`);
}

async function initMaps() {
    initModalMap();
    const apiRes = await fetch("/tutor/students", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    const students = await apiRes.json();

    const initialPosition = { lat: 19.3296515, lng: -99.1118858 };// Debe ser punto medio entre escuela y casa

    for (const student of students.students) {
        if (!student.deviceId) {
            console.warn(`El estudiante ${student.names} no tiene un deviceId.`);
            continue;
        }

        const map = new google.maps.Map(document.getElementById(student.deviceId), {
            zoom: 15,
            center: initialPosition,
            disableDefaultUI: true,
            gestureHandling: "none",
            draggable: false,
        });

        maps[student.deviceId] = { map, marker: null };
    }

    connectSocket();
}

function connectSocket() {
    const socket = io();

    socket.on('connect', () => {
        console.log("Conectado al servidor de sockets");
    });

    socket.emit("subscribe-guardian", {});

    socket.on("unauthorized", (message) => {
        alert("No autorizado para ver este dispositivo: " + message);
    });

    socket.on("location-update", (data) => {
        const lat = Number(data.lat);
        const lng = Number(data.lng);
        const newPosition = { lat, lng };
        const dateTime = new Date(data.dateTime);
        const now = new Date();

        // Calcular la diferencia de tiempo en milisegundos
        const timeDifference = now - dateTime;
        timeDifferences.push(timeDifference);

        // Mantener solo los últimos 100 valores
        if (timeDifferences.length > 100) {
            timeDifferences.shift();
            console.log(timeDifferences);
        }

        // Calcular e imprimir el promedio
        calculateAverageTimeDifference();

        if (maps[data.deviceId]) {
            const { map, marker } = maps[data.deviceId];

            map.setOptions({
                disableDefaultUI: false,
                gestureHandling: "auto",
                draggable: true,
            });

            const overlay = map.getDiv().parentElement.querySelector(".map-overlay");
            overlay.style.opacity = "0";
            setTimeout(() => overlay.style.display = "none", 500);

            if (!marker) {
                const newMarker = new google.maps.Marker({
                    position: newPosition,
                    map: map,
                    //TODO: User icon to change marker icon
                });
                maps[data.deviceId].marker = newMarker;
            }

            maps[data.deviceId].marker.setPosition(newPosition);

            const button = document.getElementById(`status-button-${data.deviceId}`);
            if (button) {
                button.classList.add('status-animated');
                button.classList.remove('status-safe');
                button.classList.add('status-moving');
                button.innerHTML = `En movimiento <span class="las la-rss"></span>`;
            }


        } else {
            console.warn(`No se encontró un mapa para el deviceId: ${data.deviceId}`);
        }
    });

    socket.on("safe-zone-update", (data) => {
        if (data.inSafeZone === true) {
            const button = document.getElementById(`status-button-${data.deviceId}`);
            if (button) {
                button.classList.add('status-animated');
                button.classList.remove('status-moving');
                button.classList.add('status-safe');
                button.innerHTML = `En zona segura <span class="las la-rss"></span>`;
            }
        }
    });
}