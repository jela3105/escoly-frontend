const maps = {}; // Objeto para almacenar referencias a mapas y marcadores por deviceId

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
    });

    socket.emit("subscribe-guardian", {});

    socket.on("unauthorized", (message) => {
        alert("No autorizado para ver este dispositivo: " + message);
    });

    socket.on("location-update", (data) => {

        const lat = Number(data.lat);
        const lng = Number(data.lng);
        const newPosition = { lat, lng };

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
            //map.setCenter(newPosition);

        } else {
            console.warn(`No se encontró un mapa para el deviceId: ${data.deviceId}`);
        }
    });
}