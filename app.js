// Initialize map (Peradeniya area)
const map = L.map("map").setView([7.2549, 80.5974], 17);

// Load map tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let userMarker = null;
let accuracyCircle = null;

navigator.geolocation.watchPosition(
  (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy; // meters

    console.log("Accuracy:", accuracy);

    // Ignore very bad readings
    if (accuracy > 100) return;

    const userLatLng = [lat, lng];

    if (!userMarker) {
      userMarker = L.marker(userLatLng).addTo(map);
      accuracyCircle = L.circle(userLatLng, {
        radius: accuracy,
      }).addTo(map);
      map.setView(userLatLng, 18);
    } else {
      userMarker.setLatLng(userLatLng);
      accuracyCircle.setLatLng(userLatLng);
      accuracyCircle.setRadius(accuracy);
    }
  },
  (error) => {
    alert("Location error. Enable location and refresh.");
    console.error(error);
  },
  {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 20000,
  }
);

const CAMPUS_BOUNDS = {
  north: 7.2585,
  south: 7.2505,
  east: 80.6035,
  west: 80.5905,
};

function isInsideCampus(lat, lng) {
  return (
    lat <= CAMPUS_BOUNDS.north &&
    lat >= CAMPUS_BOUNDS.south &&
    lng <= CAMPUS_BOUNDS.east &&
    lng >= CAMPUS_BOUNDS.west
  );
}

if (!isInsideCampus(lat, lng)) {
  console.log("Outside campus — waiting for better fix");
  return;
}

