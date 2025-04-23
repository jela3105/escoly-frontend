function initMap() {
    const initialPosition = { lat: 19.4326, lng: -99.1332 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: initialPosition,
    });

    marker = new google.maps.Marker({
        position: initialPosition,
        map: map,
        title: "Ubicación actual",
    });

    connectSocket();
}

function connectSocket() {

    const socket = io("http://localhost:3000");

    socket.emit("subscribe-to-device", "DISPOSITIVO123");

    socket.on("unauthorized", (message) => {
        alert("No autorizado para ver este dispositivo: " + message);
    });

    socket.on("location-update", (data) => {
        const lat = Number(data.lat)
        const lng = Number(data.lng)
        const newPosition = { lat, lng };
        marker.setPosition(newPosition);
        map.setCenter(newPosition);
    });
}