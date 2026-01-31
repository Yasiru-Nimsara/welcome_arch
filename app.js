// 1. Initialize map (Centered at Peradeniya University)
const map = L.map("map").setView([7.2549, 80.5974], 16);

// 2. Load Free OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Variables to store the user's marker and accuracy circle
let userMarker, userCircle;

// 3. Function to handle high-accuracy location
function locateUser() {
  map.locate({
    setView: true, 
    maxZoom: 18,
    enableHighAccuracy: true, // Forces GPS use
    timeout: 10000,           // Wait 10 seconds
    maximumAge: 0             // No cached data
    });
}

// 4. Success Callback
function onLocationFound(e) {
// Remove old marker/circle before adding new ones
  if (userMarker) {
    map.removeLayer(userMarker);
    map.removeLayer(userCircle);
  }

  const radius = e.accuracy;

  // Add circle to show the "Margin of Error"
  userCircle = L.circle(e.latlng, radius, {
    color: '#136aec',
    fillColor: '#136aec',
    fillOpacity: 0.15
    }).addTo(map);

    // Add the marker
    userMarker = L.marker(e.latlng).addTo(map)
    .bindPopup("You are within " + Math.round(radius) + " meters of this point").openPopup();
}

// 5. Error Callback
function onLocationError(e) {
  alert("Error: " + e.message + ". Please ensure GPS is ON and you are using HTTPS.");
}

// Attach events to map
map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

// 6. Function for your Place Buttons
function goToPlace(lat, lng) {
  map.flyTo([lat, lng], 18, {
    animate: true,
    duration: 1.5
  });
  L.marker([lat, lng]).addTo(map).bindPopup("Destination Reached").openPopup();
}

// Automatically try to find user on page load
locateUser();

// Buttons (still placeholders)
document.getElementById("ar-btn").onclick = () => {
  alert("AR button clicked");
};

document.getElementById("more-btn").onclick = () => {
  alert("More menu clicked");
};
