// Initialize map centered near University of Peradeniya
const map = L.map("map").setView([7.2549, 80.5974], 17);

// Load OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Show user's current location
map.locate({ setView: true, maxZoom: 18 });

map.on("locationfound", (e) => {
  L.marker(e.latlng)
    .addTo(map)
    .bindPopup("You are here")
    .openPopup();
});

map.on("locationerror", () => {
  alert("Location access denied. Please enable GPS.");
});

// Buttons still work
document.getElementById("ar-btn").onclick = () => {
  alert("AR button clicked");
};

document.getElementById("more-btn").onclick = () => {
  alert("More menu clicked");
};