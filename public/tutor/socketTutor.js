async function initMaps() {

    const apiRes = await fetch("http://localhost:3001/tutor/students",
        {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }
    );

    const students = await apiRes.json();

    const initialPosition = { lat: 19.4326, lng: -99.1332 };

    for (const student of students.students) {
        if (!student.deviceId) {
            return;
        }

        map = new google.maps.Map(document.getElementById(student.deviceId), {
            zoom: 15,
            center: initialPosition,
        });

        marker = new google.maps.Marker({
            position: initialPosition,
            map: map,
            title: "Ubicación actual",
        });

    };

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

        const lat = Number(data.lat)
        const lng = Number(data.lng)
        const newPosition = { lat, lng };

        map = new google.maps.Map(document.getElementById(data.deviceId), {
            zoom: 15,
            center: newPosition,
        });

        marker = new google.maps.Marker({
            position: newPosition,
            map: map,
            title: "Ubicación actual",
        });


        marker.setPosition(newPosition);
        map.setCenter(newPosition);
    });
}