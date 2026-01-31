// Initialize map (Peradeniya area)
const map = L.map("map").setView([7.2549, 80.5974], 17);

// Load map tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let userMarker = null;
let accuracyCircle = null;

navigator.geolocation.getCurrentPosition((pos) => {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  const map = L.map('map').setView([lat, lng], 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  L.marker([lat, lng]).addTo(map)
    .bindPopup("You are here 📍")
    .openPopup();
});