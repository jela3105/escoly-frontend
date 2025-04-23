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
}