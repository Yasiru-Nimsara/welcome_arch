let map;
let userMarker = null;
const mapDiv = document.getElementById("map");
const u_dot = document.getElementById("u-dot-img");
const more = document.getElementById("more");
const more_cont = document.getElementById("more-cont");
let lat = 7.2549;
let lng = 80.5974;

function initMap() {
  const FACULTY_BOUNDS = {
    north: 7.258779806061472,
    south: 7.24484986400125,
    west: 80.59311013931251,
    east: 80.59941333064015
  };

  // remove resize automatically
  google.maps.event.trigger(map, "resize");

  // Initialize map centered at faculty (temporary)
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 7.2549, lng: 80.5974 },
    zoom: 18,
    fullscreenControl: false,
    zoomControl: false,
    mapTypeControl: true,
    streetViewControl: true,
    gestureHandling: "greedy",
    disableDoubleClickZoom: false,
    restriction: {
      latLngBounds: FACULTY_BOUNDS,
      strictBounds: true
    },
    mapTypeId: "terrain"
  });

  // Initial marker at default location
  userMarker = new google.maps.Marker({
    map: map,
    icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#4285F4",
        fillOpacity: 1,
        strokeWeight: 2,
      strokeColor: "white"
    }
    });
  
  // Draw boundary rectangle
  const facultyRectangle = new google.maps.Rectangle({
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FFCCCC",
    fillOpacity: 0.0,
    bounds: FACULTY_BOUNDS,
    map: map
  });

  startLiveTracking();
}

function startLiveTracking() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }
    
    navigator.geolocation.watchPosition(
        (position) => {
            lat = position.coords.latitude;
            lng = position.coords.longitude;

			const bounds = new google.maps.LatLngBounds();
            
            console.log("GPS update:", lat, lng, "accuracy:", position.coords.accuracy);
            
            const pos = { lat, lng };
            
            userMarker.setPosition(pos);
            map.setCenter(pos);

			map.setCenter(bounds.getCenter());
            map.setZoom(18);
        },
        (error) => {
          console.error("GPS error:", error);
          alert("Location error: " + error.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 20000
        }
    );
}

const endPoints = {
  washrooms: [
    {name: "wus", lat: 7.256245470040582, lng: 80.59617672814801},
    {name: "gym", lat: 7.2560086652170925, lng: 80.59522856725818},
    {name: "auditorium", lat: 7.257178054130082, lng: 80.59534792556126},
    {name: "mainhall", lat: 7.257473394196346, lng: 80.59487853898825},
    {name: "AB", lat: 7.256760799590767, lng: 80.59445588178987}
  ],
  canteens: [
    {name: "milkbar", lat: 7.255575334302965, lng: 80.59949105334108},
	  {name: "wus", lat: 7.2563748882181445, lng: 80.59621710591911},
	  {name: "juiceshop", lat: 7.256317017403282, lng: 80.59593078011244},
	  {name: "non-academic", lat:7.254837045981634, lng: 80.59630876612005},
	  {name: "gemba", lat: 7.2545326595943465, lng: 80.5978916131001}
  ],
  auditorium: [
    {name: "auditorium", lat: 7.257019112237462, lng: 80.59544275630293}
  ],
  facBoard: [
    {name: "facBoard", lat: 7.25719937619214, lng: 80.59593829440817}
  ],
  senate: [
    {name: "senate", lat: 7.254648248489984, lng: 80.59666274520463}
  ],
  library: [
    {name: "library", lat: 7.2548132141597925, lng: 80.59678344460478}
  ],
  gym: [
    {name: "gym", lat: 7.255950761260709, lng: 80.59507236011356}
  ],
  ictLab: [
    {name: "ictLab", lat: 7.256327254316745, lng: 80.59564635283276}
  ],
  AB: [
    {name: "AB", lat: 7.256699138934752, lng: 80.59454297353152}
  ],
  ground: [
    {name: "ground", lat: 7.257798790380918, lng: 80.5971380122528}
  ],
  boc: [
    {name: "boc", lat: 7.25380563373444, lng: 80.59714429091864}
  ],
  peoples: [
    {name: "peoples", lat: 7.253777695971411, lng: 80.59709534056039}
  ],
  carPark: [
    {name: "carPark", lat: 7.253595435089115, lng: 80.59673123071069}
  ]
}

let markers = [];

more_cont.addEventListener("click", () => {
  more.classList.toggle("show-more");
  more_cont.classList.toggle("show-more-cont");
});

mapDiv.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
});

const carPark = document.getElementById("carPark");
const washrooms = document.getElementById("washrooms");
const canteens = document.getElementById("canteen");
const auditorium = document.getElementById("auditorium");
const facBoard = document.getElementById("facBoard");
const boc = document.getElementById("boc");
const peoples = document.getElementById("peoples");
const senate = document.getElementById("senat");
const library = document.getElementById("library");
const gym = document.getElementById("gym");
const AB = document.getElementById("ab");
const ictLab = document.getElementById("ict");
const ground = document.getElementById("ground");

carPark.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("carPark");
});

function showPlaces(type) {
  // Remove existing markers
  markers.forEach(marker => marker.setMap(null));
  markers = [];
  console.log("type: " + type);
  console.log("markers: " + markers);

  // Add new markers
  endPoints[type].forEach(place => {
    const marker = new google.maps.Marker({
      position: { lat: place.lat, lng: place.lng },
      map: map,
      title: place.name
    });
    markers.push(marker);
  });

  // Optional: draw lines from center of faculty (reference point) to each place
  const referencePoint = { lat: lat, lng: lng }; // e.g., main entrance or arch
  console.log("lat: " + lat + " lng: " + lng);
  endPoints[type].forEach(place => {
    new google.maps.Polyline({
      path: [referencePoint, { lat: place.lat, lng: place.lng }],
      geodesic: true,
      strokeColor: "#0000FF",
      strokeOpacity: 0.6,
      strokeWeight: 2,
      map: map
    });
  });

}

