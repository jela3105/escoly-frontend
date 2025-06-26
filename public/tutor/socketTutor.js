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
let circle; // **Nueva variable global para el círculo**
let currentLocation = null; // **Nueva variable para guardar la ubicación actual seleccionada**

// Datos de ejemplo para las ubicaciones
const locations = [
    { name: "Casa 1", lat: 19.317987, lng: -99.106662 },
    { name: "Casa 2", lat: 19.319310, lng: -99.104125 },
];

// --- Funcionalidad del Modal ---
openModalBtn.addEventListener('click', () => {
    locationModal.style.display = 'flex'; // Usar flex para centrar el contenido
    if (map) {
        google.maps.event.trigger(map, 'resize');
        // Centrar el mapa en la primera ubicación y dibujar marcador/círculo al abrir
        if (locations.length > 0) {
            currentLocation = locations[0]; // Establecer la primera ubicación como la actual
            map.setCenter({ lat: currentLocation.lat, lng: currentLocation.lng });
            updateMarkerAndCircle(); // Llamar a esta función para dibujar/actualizar
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
function initMap() {
    // Coordenadas iniciales (por ejemplo, Ciudad de México)
    currentLocation = locations.length > 0 ? locations[0] : { lat: 19.432608, lng: -99.133209 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 20,
        center: { lat: currentLocation.lat, lng: currentLocation.lng },
    });

    // Generar botones de ubicación después de que el mapa esté listo
    createLocationButtons();
    // Dibujar el marcador y el círculo inicial
    updateMarkerAndCircle();
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
            currentLocation = location; // Actualizar la ubicación actual
            map.setCenter({ lat: currentLocation.lat, lng: currentLocation.lng });
            updateMarkerAndCircle(); // Actualizar marcador y círculo
        });
        locationButtonsContainer.appendChild(button);
    });
}

// --- Función para actualizar el Marcador y el Círculo ---
function updateMarkerAndCircle() {
    if (!currentLocation) return; // No hacer nada si no hay ubicación seleccionada

    // **Actualizar o crear el marcador**
    if (!marker) {
        marker = new google.maps.Marker({
            map: map,
            title: currentLocation.name
        });
    }
    marker.setPosition({ lat: currentLocation.lat, lng: currentLocation.lng });
    marker.setTitle(currentLocation.name);

    // **Actualizar o crear el círculo**
    const radius = parseFloat(rangeInput.value); // Obtener el valor actual de la barra de rango
    if (!circle) {
        circle = new google.maps.Circle({
            strokeColor: "#102040",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#102040",
            fillOpacity: 0.35,
            map: map,
            center: { lat: currentLocation.lat, lng: currentLocation.lng },
            radius: radius, // El radio inicial
        });
    } else {
        circle.setCenter({ lat: currentLocation.lat, lng: currentLocation.lng });
        circle.setRadius(radius);
    }
}

// --- Barra de Rango ---
rangeInput.addEventListener('input', () => {
    rangeValueSpan.textContent = rangeInput.value + " m"; // Actualizar el texto del span con el valor actual del rango
    // **Actualizar el círculo cuando el valor del rango cambia**
    if (circle && currentLocation) { // Asegurarse de que el círculo y la ubicación existen
        const newRadius = parseFloat(rangeInput.value);
        circle.setRadius(newRadius);
    }
});

function calculateAverageTimeDifference() {
    if (timeDifferences.length === 0) return;

    const sum = timeDifferences.reduce((acc, diff) => acc + diff, 0);
    const average = sum / timeDifferences.length;
    console.log(`Promedio de diferencia de tiempo (ms): ${average}`);
}

async function initMaps() {
    initMap();
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