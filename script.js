let map;
let currentMarker = null;
let panorama = null;
let userMarker = null;
const mapDiv = document.getElementById("map");
const u_dot = document.getElementById("u-dot-img");
const more = document.getElementById("more");
const more_cont = document.getElementById("more-cont");
let lat = 7.2549;
let lng = 80.5974;

function initMap() {
  const FACULTY_BOUNDS = {
    north: 7.267418171655007, //
    south: 7.241272143676761,
    west: 80.59207275410844,
    east: 80.6005066188864
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

  show_sikka_points();
}

function show_sikka_points() {
  const sikka_points = [
    {place: "Colombo Halt 01", lat: 7.265605625646994, lng: 80.59574492748523, sikka1: "Geeth", sikka2: "Althaf"},
    {place: "Colombo Halt 02", lat: 7.265539108835222, lng: 80.59598900850628, sikka1: "Kaveen", sikka2: "Bometh"},
    {place: "Galaha Junction", lat: 7.265580379799675, lng: 80.59667092902211, sikka1: "Krishan", sikka2: "Theekshana"},
    {place: "Medical Faculty", lat: 7.263029575538976, lng: 80.5983716659132, sikka1: "Bometh", sikka2: "Kaveen"},
    {place: "Wijewardhana Hall", lat: 7.260736962351374, lng: 80.59974725113602, sikka1: "Isuru", sikka2: "Achalitha"},
    {place: "Near the Ground car Park", lat: 7.258576468051648, lng: 80.59874947019904, sikka1: "", sikka2: ""},
    {place: "Alwis pond", lat: 7.2587760369564185, lng: 80.59960512922707, sikka1: "Anjana", sikka2: "Sejinthan"},
    {place: "Hela Bojun", lat: 7.262120576824156, lng: 80.59618380151491, sikka1: "Binuka", sikka2: "Dihen"},
    {place: "Near the preschool", lat: 7.258922322141049, lng: 80.5953386656956, sikka1: "Kamesh", sikka2: "Manorajan"},
    {place: "Out Gaha", lat: 7.255459383699053, lng: 80.5990955006636, sikka1: "Duminda", sikka2: "Charith"},
    {place: "Rajathel Mawatha", lat: 7.255931607497495, lng: 80.5991273150183, sikka1: "Sadika", sikka2: "Shashidaran"},
    {place: "Rasthiyadu Mawatha", lat: 7.255962490007838, lng: 80.59675630838161, sikka1: "Hansamal", sikka2: "Dinukshan"},
    {place: "WUS", lat: 7.256066291960554, lng: 80.59642281753487, sikka1: "Anushka", sikka2: "Nisal"},
    {place: "ATM", lat: 7.253778440868385, lng: 80.59715320556987, sikka1: "Hirusha", sikka2: ""},
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
        scaledSize: new google.maps.Size(150, 150)
      }
    });
    const info = new google.maps.InfoWindow({
      content: `<div style="background:white;padding:4px 8px;border-radius:6px;font-weight:800;font-size:30px;z-index:99;">
                  <div style="font-size:35px;font-weight:600">${point.place}</div> <br>
                  <div style="font-family:monospace;font-weight:300;">${point.sikka1} and ${point.sikka2}</div>
                </div>`
    });

    marker.addListener("click", () => {
      info.open(map, marker);
    });
  });
};

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


const endPoints = {
  washrooms: [
    {name: "WUS", lat: 7.2562507250160015, lng: 80.5961705982571},
    {name: "Gymnasium", lat: 7.2560086652170925, lng: 80.59522856725818},
    {name: "Auditorium", lat: 7.257178054130082, lng: 80.59534792556126},
    {name: "Mainhall", lat: 7.257473394196346, lng: 80.59487853898825},
    {name: "AB Hall", lat: 7.256760799590767, lng: 80.59445588178987}
  ],
  canteens: [
    {name: "Milkbar", lat: 7.255566329181511, lng: 80.59949324926704},
	  {name: "WUS", lat: 7.256372657255441, lng: 80.596216506368},
	  {name: "JuiceBar WUS", lat: 7.256318777532445, lng: 80.59593286277762},
	  {name: "Gemba", lat: 7.254666768039756, lng: 80.59778535892463},
    {name: "Hela Bojun", lat: 7.26221564255007, lng: 80.59622403185925}
  ],
  auditorium: [
    {name: "Auditorium", lat: 7.257040622376647, lng: 80.59543755381374}
  ],
  facBoard: [
    {name: "Faculty_Board", lat: 7.257341795134218, lng: 80.59597970541614}
  ],
  senate: [
    {name: "Senate", lat: 7.254648248489984, lng: 80.59666274520463}
  ],
  library: [
    {name: "Library", lat: 7.2548132141597925, lng: 80.59678344460478}
  ],
  gym: [
    {name: "Gymnasium", lat: 7.2559475780815355, lng: 80.59506841908592}
  ],
  ictLab: [
    {name: "ICT Lab", lat: 7.256345356957031, lng: 80.59564643513052}
  ],
  AB: [
    {name: "AB_Hall", lat: 7.256826659010892, lng: 80.59452515625581}
  ],
  ground: [
    {name: "Ground", lat: 7.257828503537026, lng: 80.59712811500161}
  ],
  boc: [
    {name: "BOC", lat: 7.25377249964832, lng: 80.5971319747589}
  ],
  peoples: [
    {name: "Peoples", lat: 7.25378048187531, lng: 80.5970957649357}
  ],
  carPark: [
    {name: "Gymnasium", lat: 7.255991428104067, lng: 80.59527546177668},
    {name: "Gemba", lat: 7.254633488902085, lng: 80.59762307713538},
    {name: "Wala", lat: 7.25118305375382, lng: 80.59753291756482},
    {name: "WUS", lat: 7.2560947082981855, lng: 80.59649708653185}
  ],
  communication: [
    {name: "Communication", lat: 7.256321535356321, lng: 80.59601764166456}
  ],
  geography: [
    {name: "Geography_Building", lat: 7.255950363750723, lng: 80.59635224724673}
  ],
  jamesPeiris: [
    {name: "James_Peiris_Hostel", lat: 7.250424912482173, lng: 80.59801076047431}
  ],
  nadan: [
    {name: "Nadan_Hostel", lat: 7.246206896041009, lng: 80.59733529116548}
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
const senate = document.getElementById("senate");
const library = document.getElementById("library");
const gym = document.getElementById("gym");
const AB = document.getElementById("ab");
const ictLab = document.getElementById("ict");
const ground = document.getElementById("ground");
const communication = document.getElementById("communication");
const geography = document.getElementById("geography");
const jp = document.getElementById("jamesPeiris");
const nadan = document.getElementById("nadan");

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

  places.forEach(place => {
    const marker = new google.maps.Marker({
      position: { lat: place.lat, lng: place.lng },
      map: map,
      icon: {
        url: "/Welcome_Arch/Assets/red-dot.png",
        scaledSize: new google.maps.Size(200, 100)
      },
      title: place.name
    });

    const content = place.name.split(" ").map(word => `${word}<br>`).join(""); 
    console.log(content);
    const infoWin = new google.maps.InfoWindow({
      content: `<div style="background:white;padding:4px 8px;border-radius:6px;font-weight:400;font-size:30px;z-index:100;">
                  ${content}
                </div>`
    });
    infoWin.open(map, marker)

    // Marker click → open Street View
    marker.addListener("click", () => {
      openStreetView(place);
    });

    markers.push(marker);
  });

    // Auto-open Street View if only one place
    if (places.length === 1) {
      openStreetView(places[0]);
    } else {
      // Multiple places → fit all markers nicely
      const bounds = new google.maps.LatLngBounds();

      places.forEach(place => {
        bounds.extend({ lat: place.lat, lng: place.lng });
      });

      map.fitBounds(bounds);

      // Optional: prevent zooming too far out
      if (map.getZoom() > 20) {
        map.setZoom(20);
      }
    }
}

function openStreetView(place) {
  document.getElementById("streetview-cont").style.display = "block";

  // we add the place photo or 3D model //
}

const streetview_close = document.getElementById("streetview-close-img");

streetview_close.addEventListener("click", () => {
  if (markers.length === 1){
    markers.forEach(marker => marker.setMap(null));
    markers = [];
  };
  document.getElementById("streetview-cont").style.display = "none";
  more_cont.style.display = "block";
});

async function locateUser() {
  try {
    const { lat, lng } = await get_user_current_location();

    const pos = { lat, lng };
    map.setCenter(pos);
    map.setZoom(20);

    // Remove old marker if exists
    if (userMarker) {
      userMarker.setMap(null);
    }

    // Add new marker
    userMarker = new google.maps.Marker({
      position: pos,
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

    // Warning message
    const info = new google.maps.InfoWindow({
      content: `<strong>Your current location</strong><br><small style="color:#666">⚠ Location may not be accurate</small>`});

      info.open(map, userLocationMarker);

  } catch (e) {
    alert("Location access failed");
  }
}



document.getElementById("cur-loc").onclick = () => {
  let userPos = get_user_current_location();
  locateUser();
};
