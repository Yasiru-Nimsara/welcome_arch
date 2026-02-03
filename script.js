let map;
let scene, camera, renderer, model, animationId;
let is3Dshow = false;
let directionsService;
let infoWindow = null;
let currentMarker = null;
let userMarker = null;
let panorama = null;
let currentLat = null;
let currentLng = null;
let watchID = null;
let startPointEnd = null;
let autoNavInterval = null;
let AUTO_DESTINATION = null;
let drawRoute = false;
let autoNavRoutes = {};
let QRNavRoutes = {};
let userInfoWindow = null;
const mapDiv = document.getElementById("map");
const u_dot = document.getElementById("u-dot-img");
const more = document.getElementById("more");
const more_cont = document.getElementById("more-cont");
const cls_nav = document.getElementById("close-nav-cont");
const warning = document.getElementById("ask-for-google-map");
const warning_close = document.getElementById("ask-close");
const warning_navigate = document.getElementById("ask-btn-cont");
let lat = 7.2549;
let lng = 80.5974;

const big_loader = document.getElementById("big-loader-cont");

function initMap() {
  const FACULTY_BOUNDS = {
    north: 7.271305109522693,
    south: 7.241272143676761,
    west: 80.59207275410844,
    east: 80.6005066188864
  };

  google.maps.event.trigger(map, "resize");

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

  directionsService = new google.maps.DirectionsService();

  map.getStreetView().addListener("visible_changed", () => {
    if (map.getStreetView().getVisible()) {
      more_cont.classList.add("hide");
    } else {
      more_cont.classList.remove("hide");
    }
  });

  userMarker = new google.maps.Marker({
    map: map,
    title: "You are here",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#16C47F",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white"
    }
  });

  infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="min-width:200px">
        <div style="position: relative;font-size: 18px;font-weight: 800;text-align: justify;justify-content: center;align-items: center;display: flex;padding: 20px 20px 0 20px;">
        ⚠️ Due to browser and privacy limitations, this website cannot follow your live location accurately, please open directions in Google Maps. You can come back to this website anytime using your phone’s back button.<br>
        බ්‍රවුසර් හා පෞද්ගලිකත්ව සීමා හේතුවෙන් මෙම වෙබ් අඩවියට ඔබගේ සජීවී ස්ථානය නිවැරදිව අනුගමනය කළ නොහැක, Google Maps තුළින් මාර්ගෝපදේශනය විවෘත කරන්න. ඔබගේ දුරකථනයේ Back බොත්තම භාවිතා කර ඔබට ඕනෑම වේලාවක මෙම වෙබ් අඩවියට නැවත පැමිණිය හැක.
        </div>
        <button 
          onclick="openGoogleMap()"
          style="
            width:100%;
            padding:8px 10px;
            border:none;
            border-radius:6px;
            background:#1a73e8;
            color:white;
            font-weight:600;
            cursor:pointer;
          "
        >
          🧭 Open in Google Maps
        </button>
      </div>
    `
  });
  
  const facultyRectangle = new google.maps.Rectangle({
    strokeColor: "#0BA6DF",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FFCCCC",
    fillOpacity: 0.0,
    bounds: FACULTY_BOUNDS,
    map: map
  });

  show_sikka_points();
  startTracking()
  navigate_user_to_Thorana();
}

function get_user_current_location() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

function openGoogleMap(){
  if (!navigator.geolocation) {
    alert("Location not supported on this device.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Opens Google Maps app on mobile (or web fallback)
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, "_blank");
    },
    () => {
      alert("Could not get your location. Please allow location access.");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};

const routeRenderers = {};
function drawRoadRoute(id, start, end, routeColor) {
  const endPlace = end;
  big_loader.style.display = "flex";
  const request = {
    origin: start,
    destination: endPlace,
    travelMode: google.maps.TravelMode.WALKING
  };

  const renderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    preserveViewport: true,
    polylineOptions: {
      strokeColor: routeColor,
      strokeWeight: 6,
      strokeOpacity: 1
    }
  });

  routeRenderers[id] = renderer;

  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      cls_nav.style.display = "block";
      renderer.setDirections(result);
      drawRoute = true;
      autoNavRoutes = {nav: true, lat: endPlace.lat, lng: endPlace.lng};
      start = null; end = null;
    } else {
      console.error("Route failed:", status);
      if (Object.prototype.hasOwnProperty.call(routeRenderers, "RouteQR")) {
        clearRoute("RouteQR");
        drawRoute = false;
      } else {
        if (Object.prototype.hasOwnProperty.call(routeRenderers, "RouteAUTO")) {
          clearRoute("RouteAUTO");
          drawRoute = false;
        }
      }
    }
    big_loader.style.display = "none";
    warning.style.display = "block";
  });
}


function clearRoute(id) {
  if (routeRenderers[id]) {
    cls_nav.style.display = "none";
    routeRenderers[id].setMap(null);
    delete routeRenderers[id];
    autoNavRoutes = {nav: false, lat: 0, lng: 0};
  }
}

warning_close.addEventListener("click", () => {
  warning.style.display = "none";
});

warning_navigate.addEventListener("click", () => {
  if (!AUTO_DESTINATION) {
    alert("Please select a place first.");
    return;
  }
  const { lat, lng } = AUTO_DESTINATION;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  window.open(url, "_blank");
});

cls_nav.addEventListener("click", () => {
  if (Object.prototype.hasOwnProperty.call(routeRenderers, "RouteQR")) {
    clearRoute("RouteQR");
  }
  if (Object.prototype.hasOwnProperty.call(routeRenderers, "RouteAUTO")) {
    clearRoute("RouteAUTO");
  }
  // AUTO_DESTINATION = null;
  // drawRoute = false;
  markers.forEach(marker => marker.setMap(null));
  markers = [];
});

function show_sikka_points() {
  const sikka_points = [
    {place: "Colombo Halt 01", lat: 7.265605625646994, lng: 80.59574492748523, sikka1: "Geeth", sikka2: "Althaf"},
    {place: "Colombo Halt 02", lat: 7.265539108835222, lng: 80.59598900850628, sikka1: "Kaveen", sikka2: "Bometh"},
    {place: "Galaha Junction", lat: 7.265580379799675, lng: 80.59667092902211, sikka1: "Krishan", sikka2: "Theekshana"},
    {place: "Medical Faculty", lat: 7.263029575538976, lng: 80.5983716659132, sikka1: "Bometh", sikka2: "Kaveen"},
    {place: "Wijewardhana Hall", lat: 7.260736962351374, lng: 80.59974725113602, sikka1: "Isuru", sikka2: "Achalitha"},
    {place: "Near the Ground car Park", lat: 7.258576468051648, lng: 80.59874947019904, sikka1: "", sikka2: ""},
    {place: "Alwis pond", lat: 7.2587760369564185, lng: 80.59960512922707, sikka1: "Anjana", sikka2: "Sejinthan"},
    {place: "Hela Bojun", lat: 7.262394596711491, lng: 80.59619015015559, sikka1: "Binuka", sikka2: "Dihen"},
    {place: "Near the preschool", lat: 7.258922322141049, lng: 80.5953386656956, sikka1: "Kamesh", sikka2: "Manorajan"},
    {place: "Otu Gaha", lat: 7.255459383699053, lng: 80.5990955006636, sikka1: "Duminda", sikka2: "Charith"},
    {place: "Rajathel Mawatha", lat: 7.255931607497495, lng: 80.5991273150183, sikka1: "Sadika", sikka2: "Shashidaran"},
    {place: "Rasthiyadu Mawatha", lat: 7.255962490007838, lng: 80.59675630838161, sikka1: "Hansamal", sikka2: "Dinukshan"},
    {place: "WUS", lat: 7.255968490117731, lng: 80.5960639730417, sikka1: "Anushka", sikka2: "Nisal"},
    {place: "ATM", lat: 7.253776295547575, lng: 80.59724705400275, sikka1: "Hirusha", sikka2: "Hasini"},
    {place: "Near the Sir Ivor Jennings Statue", lat: 7.253454495381876, lng: 80.59775536149242, sikka1: "Bingun", sikka2: "Randima"},
    {place: "Wala", lat: 7.251333776221646, lng: 80.59767307009217, sikka1: "Hirusha", sikka2: "Anojan"},
    {place: "Akbar Bridge", lat: 7.252751019772638, lng: 80.5936339731747, sikka1: "Malindu", sikka2: "Yalisan"},
    {place: "Akbar Halt", lat: 7.25234727239802, lng: 80.59346817433996, sikka1: "Ishara", sikka2: "Umar"},
    {place: "Gymnasium Car Park", lat: 7.255633537860069, lng: 80.59474840204452, sikka1: "Yasiru", sikka2: "Dadsan"},
  ];
  sikka_points.forEach(point => {
    const marker = new google.maps.Marker({
      position: { lat: point.lat, lng: point.lng },
      map: map,
      title: point.place,
      icon: {
        url: "/Welcome_Arch/Assets/sikka2.png",
        scaledSize: new google.maps.Size(80, 80)
      },
      animation: google.maps.Animation.DROP
    });
    const info = new google.maps.InfoWindow({
      content: `<div style="background:white;border-radius:20px;z-index:99;">
                  <div style="font-size:18px;font-weight:600">${point.place}</div> <br>
                  <div style="font-family:monospace;font-weight:300;font-size:16px">${point.sikka1} and ${point.sikka2}</div>
                </div>`
    });

    marker.addListener("click", () => {
      info.open(map, marker);
    });
  });
};


const endPoints = {
  thorana: [
    {name: "Thorana", lat: 7.256651710575668, lng: 80.59560151112828, videoName: "thorana"}
  ],
  washrooms: [
    {name: "WUS", lat: 7.2562507250160015, lng: 80.5961705982571, videoName: "wr-wus"},
    {name: "Gymnasium", lat: 7.2560086652170925, lng: 80.59522856725818, videoName: "wr-gym"},
    {name: "Auditorium", lat: 7.257178054130082, lng: 80.59534792556126, videoName: "wr-auditorium"},
    {name: "Mainhall", lat: 7.257473394196346, lng: 80.59487853898825, videoName: "wr-mainhall"},
    {name: "AB Hall", lat: 7.256760799590767, lng: 80.59445588178987, videoName: "wr-abhall"}
  ],
  canteens: [
    {name: "Milkbar", lat: 7.255566329181511, lng: 80.59949324926704, videoName: "can-milkbar"},
	  {name: "WUS", lat: 7.256372657255441, lng: 80.596216506368, videoName: "can-wus"},
	  {name: "JuiceBar WUS", lat: 7.256318777532445, lng: 80.59593286277762, videoName: "can-juicebar"},
	  {name: "Gemba", lat: 7.254666768039756, lng: 80.59778535892463, videoName: "can-gemba"},
    {name: "Hela Bojun", lat: 7.26221564255007, lng: 80.59622403185925, videoName: "can-helabojun"}
  ],
  auditorium: [
    {name: "Auditorium", lat: 7.257040622376647, lng: 80.59543755381374, videoName: "auditorium"}
  ],
  facBoard: [
    {name: "Faculty_Board", lat: 7.257341795134218, lng: 80.59597970541614, videoName: "facultyboard"}
  ],
  senate: [
    {name: "Senate", lat: 7.254648248489984, lng: 80.59666274520463, videoName: "senate"}
  ],
  library: [
    {name: "Library", lat: 7.2548132141597925, lng: 80.59678344460478, videoName: "library"}
  ],
  gym: [
    {name: "Gymnasium", lat: 7.2559475780815355, lng: 80.59506841908592, videoName: "gymnasium"}
  ],
  ictLab: [
    {name: "ICT Lab", lat: 7.256345356957031, lng: 80.59564643513052, videoName: "ictlab"}
  ],
  AB: [
    {name: "AB_Hall", lat: 7.256826659010892, lng: 80.59452515625581, videoName: "abhall"}
  ],
  mainhall: [
    {name: "Main_Hall", lat: 7.257269834060006, lng: 80.59496965407715, videoName: "mainhall"}
  ],
  ground: [
    {name: "Ground", lat: 7.257828503537026, lng: 80.59712811500161, videoName: "ground"}
  ],
  boc: [
    {name: "BOC", lat: 7.25377249964832, lng: 80.5971319747589, videoName: "boc"}
  ],
  peoples: [
    {name: "Peoples", lat: 7.25378048187531, lng: 80.5970957649357, videoName: "peoples"}
  ],
  carPark: [
    {name: "Gymnasium", lat: 7.255991428104067, lng: 80.59527546177668, videoName: "cp-gym"},
    {name: "Gemba", lat: 7.254633488902085, lng: 80.59762307713538, videoName: "cp-gemba"},
    {name: "Wala", lat: 7.25118305375382, lng: 80.59753291756482, videoName: "cp-wala"},
    {name: "WUS", lat: 7.2560947082981855, lng: 80.59649708653185, videoName: "cp-wus"}
  ],
  communication: [
    {name: "Communication", lat: 7.256321535356321, lng: 80.59601764166456, videoName: "communication"}
  ],
  geography: [
    {name: "Geography_Building", lat: 7.255950363750723, lng: 80.59635224724673, videoName: "geographybuilding"}
  ],
  jamesPeiris: [
    {name: "James_Peiris_Hostel", lat: 7.250424912482173, lng: 80.59801076047431, videoName: "jamespeirishostel"}
  ],
  nadan: [
    {name: "Nadan_Hostel", lat: 7.246206896041009, lng: 80.59733529116548, videoName: "nadanhostel"}
  ]
}

let markers = [];

more_cont.addEventListener("click", () => {
  more.classList.toggle("show-more");
  more_cont.classList.toggle("show-more-cont");
  markers.forEach(marker => marker.setMap(null));
  markers = [];
  if (is3Dshow){
    remove3D();
  }
  removeVideo();
});

mapDiv.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
});

const thorana = document.getElementById("thorana");
const carPark = document.getElementById("carPark");
const washrooms = document.getElementById("washrooms");
const canteens = document.getElementById("canteen");
const auditorium = document.getElementById("auditorium");
const facBoard = document.getElementById("facBoard");
const boc = document.getElementById("boc");
const peoples = document.getElementById("peoples");
const senate = document.getElementById("senate");
const library = document.getElementById("library");
const gym = document.getElementById("gym");
const AB = document.getElementById("ab");
const mainhall = document.getElementById("mainhall");
const ictLab = document.getElementById("ict");
const ground = document.getElementById("ground");
const communication = document.getElementById("communication");
const geography = document.getElementById("geography");
const jp = document.getElementById("jamesPeiris");
const nadan = document.getElementById("nadan");

thorana.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("thorana");
});

carPark.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("carPark");
});

washrooms.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("washrooms");
});

canteens.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("canteens");
});

auditorium.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("auditorium");
});

facBoard.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("facBoard");
});

boc.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("boc");
});

peoples.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("peoples");
});

senate.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("senate");
});

library.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("library");
});

gym.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("gym");
});

AB.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("AB");
});

mainhall.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("mainhall");
});

ictLab.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("ictLab");
});

ground.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("ground");
});

communication.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("communication");
});

geography.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("geography");
});

jamesPeiris.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("jamesPeiris");
});

nadan.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("nadan");
});

function showPlaces(type) {
  if (Object.prototype.hasOwnProperty.call(routeRenderers, "RouteQR")) {
    clearRoute("RouteQR");
  }
  if (Object.prototype.hasOwnProperty.call(routeRenderers, "RouteAUTO")) {
    clearRoute("RouteAUTO");
  }
  
  // Remove existing markers
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  // Hide Street View initially
  document.getElementById("streetview-cont").style.display = "none";

  const places = endPoints[type];
  if (!places || places.length === 0) return;

  // Center map to first place (simple & safe)
  map.panTo({ lat: places[0].lat, lng: places[0].lng });
  map.setZoom(20);

  places.forEach(place_ => {
    const each_lat = place_.lat;
    const each_lng = place_.lng;
    const marker = new google.maps.Marker({
      position: { lat: each_lat, lng: each_lng },
      map: map,
      icon: {
        url: "/Welcome_Arch/Assets/red-dot.png",
        scaledSize: new google.maps.Size(100, 50)
      },
      title: place_.name,
      animation: google.maps.Animation.DROP
    });

    const content = place_.name.split(" ").map(word => `${word}<br>`).join(""); 
    const infoWin = new google.maps.InfoWindow({
      content: `<div style="background:white;border-radius:20px;font-weight:800;font-size:16px;justify-content:center;align-items:center;display:flex;">${content}</div>`
    });
    infoWin.open(map, marker);

    // Marker click → open Street View
    marker.addListener("click", () => {
      autoNavInterval = null;
      drawRoute = false;

      map.setCenter({ lat: each_lat, lng: each_lng });
      map.setZoom(20);

      AUTO_DESTINATION = { lat: each_lat, lng: each_lng };
      navigate_auto();

      openStreetView(place_);
    });


    markers.push(marker);
  });

    // Auto-open Street View if only one place
    if (places.length === 1) {
      autoNavInterval = null;
      drawRoute = false;
      AUTO_DESTINATION = {lat: places[0].lat, lng: places[0].lng}
      navigate_auto();
      openStreetView(places[0]);

    } else {
      // Multiple places → fit all markers nicely
      const bounds = new google.maps.LatLngBounds();

      places.forEach(place_ => {
        bounds.extend({ lat: place_.lat, lng: place_.lng });
      });

      map.fitBounds(bounds);

      // Optional: prevent zooming too far out
      if (map.getZoom() > 20) {
        map.setZoom(20);
      }
    }
}

const streetview_video = document.getElementById("streetview-video");
const streetview_cont = document.getElementById("streetview-cont");
const _3d_cont = document.getElementById("_3d-cont");
const streetview_video_loader = document.getElementById("video-loader");
const streetview_video_title = document.getElementById("video-title");
const streetview_3d = document.getElementById("streetview-3d");

function show3Dmodel() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    streetview_3d.clientWidth / streetview_3d.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 4);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(streetview_3d.clientWidth, streetview_3d.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  streetview_3d.appendChild(renderer.domElement);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  hemiLight.position.set(0, 5, 0);
  scene.add(hemiLight);

  const frontLight = new THREE.DirectionalLight(0xffffff, 1.5);
  frontLight.position.set(5, 5, 5);
  frontLight.target.position.set(0, 0, 0);
  frontLight.castShadow = true;
  frontLight.shadow.mapSize.width = 1024;
  frontLight.shadow.mapSize.height = 1024;
  frontLight.shadow.bias = -0.0005;
  scene.add(frontLight);
  scene.add(frontLight.target);

  const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
  backLight.position.set(-5, 3, -5);
  backLight.target.position.set(0, 0, 0);
  backLight.castShadow = false;
  backLight.shadow.mapSize.width = 1024;
  backLight.shadow.mapSize.height = 1024;
  backLight.shadow.bias = -0.0005;
  scene.add(backLight);
  scene.add(backLight.target);

  const fillLight = new THREE.PointLight(0xffffff, 0.6);
  fillLight.position.set(0, 3, 2);
  scene.add(fillLight);

  const groundGeo = new THREE.PlaneGeometry(8, 8);
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  const loader = new THREE.GLTFLoader();
  // loader.load("/Welcome_Arch/Assets/3Dmodel.glb", gltf => {
  loader.load("/Welcome_Arch/Assets/3d_model.glb", gltf => {
    model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5);
    model.position.set(0, 0.5, -0.7);
    model.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.material.side = THREE.DoubleSide;
        obj.material.needsUpdate = true;
      }
    });
    scene.add(model);
  });

  function animate() {
    animationId = requestAnimationFrame(animate);
    if (model) model.rotation.y += 0.005;
    renderer.render(scene, camera);
  }
  animate();
}

function openStreetView(place) {
  if (place.name === "Thorana"){
    is3Dshow = true;
    streetview_cont.style.display = "none";
    _3d_cont.style.display = "block";
    streetview_3d.style.display = "block";
    streetview_3d.innerHTML = "";
    show3Dmodel();
  } else {
    _3d_cont.style.display = "none";
    streetview_cont.style.display = "block";
    streetview_cont.style.top = "100px";
    streetview_cont.style.height = "auto";
    streetview_cont.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
    streetview_cont.style.background = "white";
    streetview_video.style.display = "none";
    streetview_video_title.textContent = place.name;

    streetview_video.src = `/Welcome_Arch/Assets/StreetViews/${place.videoName}.mp4`;
    streetview_video.loop = true;
    streetview_video.muted = true;
    streetview_video.autoplay = true;
    // streetview_video.playsInline = true;
    streetview_video.load();

    streetview_video.oncanplay = () => {
      streetview_video_loader.style.display = "none";
      streetview_video.style.display = "block";
      streetview_video.play();
    };

    streetview_video.onerror = () => {
      console.log("video error.");
      // streetview_video_loader.textContent = "Something Went Wrong!!!";
    };
  }
}

function removeVideo(){
  streetview_video.style.display = "none";
  streetview_cont.style.display = "none";
  more_cont.style.display = "block";
}

const streetview_close = document.getElementById("streetview-close-img");

streetview_close.addEventListener("click", () => {
  removeVideo();
});

function remove3D(){
  // Stop 3D animation
  if (animationId) cancelAnimationFrame(animationId);

  // Remove renderer
  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
    renderer = null;
  }

  // Clear scene
  if (scene) scene.clear();
  model = null;
  camera = null;

  // Hide 3D div (optional)
  streetview_3d.style.display = "none";
  _3d_cont.style.display = "none";
  is3Dshow = false;
}

const _3d_close = document.getElementById("_3d-close");

_3d_close.addEventListener("click", () => {
    remove3D();
});

async function locateUser() {
  big_loader.style.display = "flex";
  let pos = null;
  try {
    if (!currentLat || !currentLng) {
      console.log("Location Tracking doesn't track location yet.");
      const { lat, lng } = await get_user_current_location();
      pos = { lat: lat, lng: lng };
    } else {
      pos = { lat: currentLat, lng: currentLng };
    }
    map.setCenter(pos);
    map.setZoom(20);

    if (userMarker) {
      userMarker.setPosition(pos);
    } else {
      userMarker = new google.maps.Marker({
        position: pos,
        map: map,
        title: "You are here",
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#16C47F",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "white"
          },
      });
    }

    if (infoWindow) {
      infoWindow.open({
        anchor: userMarker,
        map: map
      });
    }

    if (autoNavRoutes.nav){
      AUTO_DESTINATION = {lat: autoNavRoutes.lat, lng: autoNavRoutes.lng};
      autoNavInterval = null;
      drawRoute = false;
      navigate_auto();
    }

  } catch (e) {
    console.log("Location access failed. Please Wait!!!");
  }
  big_loader.style.display = 'none';
}

document.getElementById("cur-loc").onclick = () => {
  locateUser();
};

// navigate junior to "Thorana" from QR scan place.
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function navigate_user_to_Thorana(){
  let startPoint = null;
  const userLat = getQueryParam("lat");
  const userLng = getQueryParam("lng");
  if (!userLat || !userLng) {
    console.log("No location in URL (empty or missing)");
    return;
  }
  if (userLat && userLng) {
    startPoint = {
      lat: parseFloat(userLat),
      lng: parseFloat(userLng)
    };
  }

  AUTO_DESTINATION = {
    lat: 7.256651710575668,
    lng: 80.59560151112828
  };
  // QR code method
  navigate_QR(startPoint, thorana);
  // location tracking method
  navigate_auto();
}

function navigate_QR(startPoint, endPoint) {
  if (startPoint) {
    QRNavRoutes = {nav: true, lat: startPoint.lat, lng: startPoint.lng};
    // Marker for QR location
    const startPointStart = new google.maps.Marker({
      position: startPoint,
      map: map,
      title: "You are here",
      icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "white"
        },
    });
    const startPointInfo = new google.maps.InfoWindow({
      content: `
        <div style="font-weight:800;font-size:16px">
          Route of <br> Managemnt Faculty
        </div>`
    });

    // Open immediately on marker
    startPointInfo.open({
      anchor: startPointStart,
      map: map
    });

    // Marker for thorana
    const startPointEnd = new google.maps.Marker({
      position: endPoint,
      map: map,
      title: "thorana here",
      icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "white"
        },
    });

    // Fit both points
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(startPoint);
    bounds.extend(endPoint);
    // map.fitBounds(bounds);

    drawRoadRoute("RouteQR", {lat: startPoint.lat, lng: startPoint.lng}, {lat: endPoint.lat, lng: endPoint.lng}, "#0BA6DF");
  }
}

function navigate_auto() {
  if (!AUTO_DESTINATION) return;

  clearRoute("RouteAUTO");

  if (autoNavInterval) {
    clearInterval(autoNavInterval);
    autoNavInterval = null;
  }

  autoNavInterval = setInterval(() => {
    if (drawRoute) return;
    if (!currentLat || !currentLng) return;

    const pos = { lat: currentLat, lng: currentLng };
    const destination = {
      lat: AUTO_DESTINATION.lat,
      lng: AUTO_DESTINATION.lng
    };

    // User marker
    if (!userMarker) {
      userMarker = new google.maps.Marker({ map });
    }
    userMarker.setPosition(pos);

    if (infoWindow) {
      infoWindow.open({
        anchor: userMarker,
        map: map
      });
    }

    // Destination marker (always update)
    if (!startPointEnd) {
      startPointEnd = new google.maps.Marker({ map });
    }
    startPointEnd.setPosition(destination);

    clearRoute("RouteAUTO");
    drawRoadRoute("RouteAUTO", { lat: currentLat, lng: currentLng }, {lat: AUTO_DESTINATION.lat, lng: AUTO_DESTINATION.lng}, "#FF9D23");

  }, 500);
}

// location tracking
function startTracking() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  watchID = navigator.geolocation.watchPosition(
    (position) => {
      currentLat = position.coords.latitude;
      currentLng = position.coords.longitude;
    },
    (error) => {
      console.warn("Location error:", error.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 10000
    }
  );
}

function stopTracking() {
  if (watchID !== null) {
    navigator.geolocation.clearWatch(watchID);
    watchID = null;
  }
}