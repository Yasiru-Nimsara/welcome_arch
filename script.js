let map;
const u_dot = document.getElementById("u-dot-img");

function initMap() {
  const FACULTY_BOUNDS = {
    north: 7.258779806061472,
    south: 7.24484986400125,
    west: 80.59311013931251,
    east: 80.59941333064015
  };

  // Initialize map centered at faculty (temporary)
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 7.2549, lng: 80.5974 },
    zoom: 18,
    restriction: {
      latLngBounds: FACULTY_BOUNDS,
      strictBounds: true
    },
    mapTypeId: "terrain"
  });

  let userMarker = null;
  // Initial marker at default location
  userMarker = new google.maps.Marker({
    position: map.getCenter(),
    map: map,
    title: "You are here",
    draggable: false,
    animation: google.maps.Animation.BOUNCE,
    icon: u_dot
  });
}

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Move marker
      userMarker.setPosition({ lat: lat, lng: lng });

      // Optionally move map center
    //   map.setCenter({ lat: lat, lng: lng });
    },
    (error) => {
      console.error("Live location error:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
} else {
  alert("Geolocation is not supported by this browser.");
}