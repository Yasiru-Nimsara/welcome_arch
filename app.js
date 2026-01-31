// Initialize map (Peradeniya area fallback)
    const map = L.map("map").setView([7.2549, 80.5974], 17);

    // Load map tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    let userMarker = null;
    let accuracyCircle = null;
    let watchId = null;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy; // meters

          console.log("Accuracy:", accuracy);

          // Ignore very bad readings (IP / weak signal)
          if (accuracy > 100) return;

          const userLatLng = [lat, lng];

          if (!userMarker) {
            userMarker = L.marker(userLatLng).addTo(map)
              .bindPopup("You are here 📍")
              .openPopup();

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
          enableHighAccuracy: true, // force GPS if possible
          maximumAge: 0,
          timeout: 20000,
        }
      );
    } else {
      alert("Geolocation is not supported on this device.");
    }

    // Buttons
    document.getElementById("ar-btn").onclick = () => {
      alert("AR button clicked");
    };

    document.getElementById("more-btn").onclick = () => {
      alert("More menu clicked");
    };

    // Optional: stop watching when leaving page
    window.addEventListener("beforeunload", () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    });