const maps = {}; // Objeto para almacenar referencias a mapas y marcadores por deviceId
const timeDifferences = []; // Array para almacenar las diferencias de tiempo

function calculateAverageTimeDifference() {
    if (timeDifferences.length === 0) return;

    const sum = timeDifferences.reduce((acc, diff) => acc + diff, 0);
    const average = sum / timeDifferences.length;
    console.log(`Promedio de diferencia de tiempo (ms): ${average}`);
}

async function initMaps() {
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

            //center map to the marker with a smooth animation
            map.panTo(newPosition);
            map.setZoom(18); // Zoom in to see the marker clearly

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