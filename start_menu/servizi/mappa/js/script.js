//TODO apertura automatica percorso per VEHICLES e SINGLE
const API_ENDPOINT = "https://ertpl-api.vichingo455.com/start";
// ======================================================================
// CONFIGURAZIONE GENERALE
// ======================================================================
async function getApiUrl() {
    const res = await fetch(API_ENDPOINT, { cache: "no-store" });
    if (!res.ok) throw new Error('Registry HA non raggiungibile: ' + res.status);
    const cfg = await res.json();
    if (cfg.status !== "ok" || !cfg.url) return null;
    return cfg.url;
}

const CONFIG = {
    // URL base dell'API. Ogni modalità aggiunge il proprio path/parametri. Non modificare a mano se si usa l'HA.
    BASE_URL: null,

    // Path per la modalità "vehicles", aggiunto a BASE_URL.
    VEHICLES_ENDPOINT: "/vehiclepositions",

    VEHICLES_BASIN_ENDPOINT: "/vehiclepositions/{basin}",

    // Template per la modalità "shapes": {shapeId} viene sostituito col valore richiesto.
    SHAPE_ENDPOINT_TEMPLATE: "/shape/{basin}/{shapeId}",

    SINGLE_VEHICLE_ENDPOINT: "/vehicleposition/{vehicle}",

    STOP_LIST_ENDPOINT: "/static/stops/{basin}",

    STOP_INFO_ENDPOINT: "/stopsinfo/{basin}/{stopCode}",

    // Intervallo di refresh dati, in millisecondi. Usato solo in modalità "vehicles".
    REFRESH_INTERVAL_MS: 30000,

    // Vista iniziale della mappa (usata finché non arrivano dati da adattare)
    INITIAL_CENTER: [44.42, 12.2],
    INITIAL_ZOOM: 11,

    STOPS_MIN_ZOOM: 14,      // sotto questo zoom le fermate vengono nascoste per performance
    STOPS_DEF_ZOOM: 14,
    GEOLOCATION_ZOOM: 16,    // zoom applicato quando la posizione GPS è disponibile
};

// Palette colori per distinguere più shape sulla stessa mappa
const SHAPE_COLORS = ["#2b9c31", "#00897b", "#1e88e5", "#fb8c00", "#8e24aa", "#e53935", "#c0ca33", "#d81b60", "#3949ab", "#6d4c41"];

// ======================================================================
// QUERY PARAMS
// ======================================================================
// ?mode=vehicles              -> mostra i mezzi in tempo reale
// ?mode=shapes&basin=FC&shapeId=8003_A -> mostra un singolo tracciato
// ?mode=shapes&basin=FC&shapeId=8003_A,8003_B,8004_C -> più tracciati, colori diversi
const params = new URLSearchParams(window.location.search);
const MODE = (params.get('mode') || 'vehicles').toLowerCase();
const SHAPE_IDS = (params.get('shapeId') || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
const VEHICLE_ID = params.get('vehicle')
const BASIN = params.get('basin')

// ======================================================================
// MAPPA
// ======================================================================
let map
if (MODE == "stops") {
    map = L.map('map', {
        markerZoomAnimation: false   //Riduzione lag modalità stops
    }).setView(CONFIG.INITIAL_CENTER, CONFIG.INITIAL_ZOOM);
} else {
    map = L.map('map', {}).setView(CONFIG.INITIAL_CENTER, CONFIG.INITIAL_ZOOM);
}

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

if (window.screen.width <= 512) {
    CONFIG.STOPS_MIN_ZOOM = 15;
    CONFIG.STOPS_DEF_ZOOM = 15;
}

const statusEl = document.getElementById('status');
const legendEl = document.getElementById('legend');

function showStatus(msg) {
    statusEl.textContent = msg;
    statusEl.style.display = 'block';
}

function hideStatus() {
    statusEl.style.display = 'none';
}

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Risposta non ok: ' + res.status);
    return res.json();
}

// ======================================================================
// MODALITÀ: VEHICLES
// ======================================================================
function busIcon(item) {
    if (item.line == "MetroMare") {
        return L.divIcon({
            className: '',
            html: `<div class="bus-icon-large">${item.line.split(" ")[0]}</div>`,
            iconSize: [34, 34],
            iconAnchor: [50, 17],
            popupAnchor: [0, -17]
        });
    } else {
        return L.divIcon({
            className: '',
            html: `<div class="bus-icon">${item.line.split(" ")[0]}</div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -17]
        });
    }

}

function vehiclePopupHtml(item) {
    let delayMess = "Ritardo:"
    let imgHtml = "";
    if (item.vehicle_info.model == null) {
        item.vehicle_info.model = "Sconosciuto"
    }
    if (item.vehicle_info.plate_num == null) {
        item.vehicle_info.plate_num = "Sconosciuto"
    }
    if (item.vehicle_info.basin == null) {
        item.vehicle_info.basin = "Sconosciuto"
    }
    if (item.vehicle_info.bus_preview_path == null) {
        imgHtml = `
            <div class="bus-image-container">
                <span>Anteprima non disponibile.</span>
            </div>
        `;
    } else {
        imgHtml = `
            <div class="bus-image-container bgtransparent">
                <img data-path="${item.vehicle_info.bus_preview_path}" data-crop="true" alt="Caricamento in corso...">
            </div>
        `;
    }
    if (item.next_stop == null) {
        item.next_stop = {
            "stop_name": "Sconosciuto",
            "stop_code": "Sconosciuto",
            "arrival_time": "Sconosciuto",
            "delay": "Sconosciuto",
        }
    }
    if (item.next_stop.delay != "Sconosciuto") {
        if (item.next_stop.delay < 0) {
            delayMess = "Anticipo:";
            item.next_stop.delay = Math.abs(item.next_stop.delay) + " MIN";
        } else if (item.next_stop.delay == 0) {
            delayMess = "In orario";
            item.next_stop.delay = ""
        } else {
            item.next_stop.delay = item.next_stop.delay + " MIN";
        }
    } else {
        delayMess = ""
        item.next_stop.delay = ""
    }
    return `
        <div class="popup-content">
            <div class="popup-head">
                <div class="dispflex">
                    <div class="line-box">${item.line}</div>
                    <div class="dest-box">${item.destination}</div>
                </div>
                <hr class="head-separator">
                <div class="head-desc">
                    <div class="dispflex">
                        <h3 style="color:white;">${delayMess} ${item.next_stop.delay}</h3>
                        <h3 style="display:flex; flex:1; justify-content:right;">Veicolo: ${item.vehicle_info.number}</h3>
                    </div>
                </div>
            </div>
            <div class="popup-base">
                <table class="up">
                    <tr><td class="label">Bacino:</td><td>${item.basin}</td></tr>
                    <tr><td class="label">Codice percorso:</td><td>${item.shape_id}</td></tr>
                    <tr><td class="label">Codice corsa:</td><td>${item.trip_id}</td></tr>
                </table>
                <a class="button" href="?mode=singlemixed&vehicle=${item.vehicle_info.number}&basin=${item.basin}&shapeId=${item.shape_id}">Visualizza il percorso</a>
                <hr class="separator">
                <table class="down">
                    <tr><td class="label">Modello:</td><td>${item.vehicle_info.model}</td></tr>
                    <tr><td class="label">Targa:</td><td>${item.vehicle_info.plate_num}</td></tr>
                    <tr><td class="label">Bacino veicolo:</td><td>${item.vehicle_info.basin}</td></tr>
                </table>
                ${imgHtml}
                <hr class="separator">
                <table class="up">
                    <tr><td class="label">Prossima fermata:</td><td>${item.next_stop.stop_name}</td></tr>
                    <tr><td class="label">Codice fermata:</td><td>${item.next_stop.stop_code}</td></tr>
                    <tr><td class="label">ETA:</td><td>${item.next_stop.arrival_time}</td></tr>
                </table>
            </div>
        </div>
    `;
}

const markersByVehicle = new Map();
const markersByStop = new Map();
let vehiclesFirstLoad = true;

function plotVehicles(data, padd) {
    if (!Array.isArray(data) || data.length === 0) {
        showStatus('Nessun mezzo da mostrare.');
        return;
    }
    hideStatus();

    const seenVehicles = new Set();

    //Lost vehicle for a second
    if (!vehiclesFirstLoad && data[0] == null) {
        showStatus('Il mezzo ha smesso di comunicare la sua posizione.');
        return;
    } else {
        hideStatus('');
    }
    data.forEach(item => {
        const key = item.trip_id;
        if (!key) return;
        seenVehicles.add(key);

        const existing = markersByVehicle.get(key);
        if (existing) {
            existing.setLatLng([item.vehicle_lat, item.vehicle_long]);
            existing.setPopupContent(vehiclePopupHtml(item));
            // Caso 2: il popup era già aperto e il contenuto (quindi anche l'img) è stato appena sostituito
            if (existing.isPopupOpen()) {
                refreshVehiclePhotos();
            }
        } else {
            const marker = L.marker([item.vehicle_lat, item.vehicle_long], { icon: busIcon(item) })
                .bindPopup(vehiclePopupHtml(item));

            //Se siamo nella modalità single mixed, questa funzione non deve partire
            if (MODE != "singlemixed") {
                marker.on('popupopen', () => {
                    spawnShape(item.basin, item.shape_id, marker);
                });
            }

            marker.addTo(map);
            markersByVehicle.set(key, marker);
        }
    });

    for (const [key, marker] of markersByVehicle.entries()) {
        if (!seenVehicles.has(key)) {
            map.removeLayer(marker);
            markersByVehicle.delete(key);
        }
    }

    if (vehiclesFirstLoad && markersByVehicle.size > 0) {
        const group = L.featureGroup(Array.from(markersByVehicle.values()));
        //Nella modalità singola la mappa non viene mai zoomata, qua nel ramo true viene forzato lo zoom
        var layers = group.getLayers();

        if (layers.length === 1) {
            map.setView(layers[0].getLatLng(), 17);
        } else {
            map.fitBounds(group.getBounds().pad(padd));
        }
        vehiclesFirstLoad = false;
    }
}

async function loadVehicles() {
    let url
    if (BASIN != undefined) {
        url = CONFIG.BASE_URL + CONFIG.VEHICLES_BASIN_ENDPOINT.replace('{basin}', encodeURIComponent(BASIN));
    } else {
        url = CONFIG.BASE_URL ? (CONFIG.BASE_URL + CONFIG.VEHICLES_ENDPOINT) : "";
    }
    if (!url) {
        showStatus('BASE_URL non impostato.');
        return;
    }
    try {
        const data = await fetchJson(url);
        plotVehicles(data, 0);
    } catch (err) {
        console.error('Errore nel fetch dei mezzi:', err);
        showStatus('Errore nel caricamento dati live: ' + err);
    }
}

function initVehiclesMode() {
    loadVehicles();
    setInterval(loadVehicles, CONFIG.REFRESH_INTERVAL_MS);
}

// ======================================================================
// MODALITÀ: SINGLE (riusa funzioni di VEHICLES)
// ======================================================================

async function loadSingle() {
    const url = CONFIG.BASE_URL + CONFIG.SINGLE_VEHICLE_ENDPOINT.replace('{vehicle}', encodeURIComponent(VEHICLE_ID));
    if (!url) {
        showStatus('BASE_URL non impostato.');
        return;
    }
    try {
        const data = await fetchJson(url);
        let dataArr = []
        dataArr[0] = data
        plotVehicles(dataArr, 13);
    } catch (err) {
        console.error('Errore nel fetch dei mezzi:', err);
        showStatus('Errore nel caricamento dati live: ' + err);
    }
}

function initSingleMode() {
    loadSingle();
    setInterval(loadSingle, CONFIG.REFRESH_INTERVAL_MS);
}

// ======================================================================
// MODALITÀ: SINGLEMIXED (SINGLE ma con anche il percorso)
// ======================================================================

async function loadSingleMixed() {
    const url = CONFIG.BASE_URL + CONFIG.SINGLE_VEHICLE_ENDPOINT.replace('{vehicle}', encodeURIComponent(VEHICLE_ID));
    if (!url) {
        showStatus('BASE_URL non impostato.');
        return;
    }
    try {
        const data = await fetchJson(url);
        let dataArr = [];
        dataArr[0] = data;
        plotVehicles(dataArr, 13);
    } catch (err) {
        console.error('Errore nel fetch dei mezzi:', err);
        showStatus('Errore nel caricamento dati live: ' + err);
    }
}

function initSingleMixedMode() {
    loadSingleMixed();
    initShapesMode();
    setInterval(loadSingleMixed, CONFIG.REFRESH_INTERVAL_MS);
}

// ======================================================================
// MODALITÀ: STOPS (con GPS)
// ======================================================================

//GPS section

let userLocationFound = false;
let userLocationMarker = null;

function userLocationIcon() {
    return L.divIcon({
        className: '',
        html: `<div class="user-location-marker">
                 <div class="user-location-pulse"></div>
                 <div class="user-location-dot"></div>
               </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

function showUserLocation(lat, lon) {
    if (userLocationMarker) {
        userLocationMarker.setLatLng([lat, lon]);
    } else {
        userLocationMarker = L.marker([lat, lon], {
            icon: userLocationIcon(),
            zIndexOffset: 1000,
            interactive: false
        }).addTo(map);
    }
}

function locateUser() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            (err) => {
                console.warn('Geolocalizzazione non disponibile:', err);
                resolve(null);
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
        );
    });
}

//END GPS section

const stopsLayerGroup = L.layerGroup();

//Per protezione dai 4 FPS se dezoomi troppo
function updateStopsVisibility() {
    const zoom = map.getZoom();
    if (zoom < CONFIG.STOPS_MIN_ZOOM) {
        if (map.hasLayer(stopsLayerGroup)) map.removeLayer(stopsLayerGroup);
        showStatus('Troppe fermate da mostrare a questo livello di zoom, avvicinati per visualizzarle.');
        return;
    }
    if (!map.hasLayer(stopsLayerGroup)) stopsLayerGroup.addTo(map);
    if (!userLocationFound) {
        showStatus('Posizione del dispositivo non disponibile.');
    } else {
        hideStatus();
    }
}

function stopIcon() {
    return L.divIcon({
        className: '',
        html: `<div class="stop-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-bus-front" viewBox="0 0 16 16">
                <path d="M16 7a1 1 0 0 1-1 1v3.5c0 .818-.393 1.544-1 2v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5V14H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2a2.5 2.5 0 0 1-1-2V8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1V2.64C1 1.452 1.845.408 3.064.268A44 44 0 0 1 8 0c2.1 0 3.792.136 4.936.268C14.155.408 15 1.452 15 2.64V4a1 1 0 0 1 1 1zM3.552 3.22A43 43 0 0 1 8 3c1.837 0 3.353.107 4.448.22a.5.5 0 0 0 .104-.994A44 44 0 0 0 8 2c-1.876 0-3.426.109-4.552.226a.5.5 0 1 0 .104.994M8 4c-1.876 0-3.426.109-4.552.226A.5.5 0 0 0 3 4.723v3.554a.5.5 0 0 0 .448.497C4.574 8.891 6.124 9 8 9s3.426-.109 4.552-.226A.5.5 0 0 0 13 8.277V4.723a.5.5 0 0 0-.448-.497A44 44 0 0 0 8 4m-3 7a1 1 0 1 0-2 0 1 1 0 0 0 2 0m8 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m-7 0a1 1 0 0 0 1 1h2a1 1 0 1 0 0-2H7a1 1 0 0 0-1 1"/>
            </svg></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17]
    });
}

function stopPopupHtml(item) {
    return `
        <div class="popup-content">
            <div class="popup-head">
                <div class="dispflex">
                    <div class="stop-name-box">${item.stop_name}</div>
                </div>
                <hr class="head-separator">
                <div class="head-desc">
                    <div class="dispflex stop-code-box">
                        Codice fermata: ${item.stop_code}
                    </div>
                </div>
            </div>
            <div class="popup-base">
                <a class="button" href="/start_menu/servizi/fermate/fermata.html?code=${item.stop_code}&basin=${item.basin}" target="_blank">Visualizza gli arrivi</a>
                <hr class="separator">
                <h3>Da questa fermata passa:</h3>
                <div class="lines-container" style="display: none;"></div>
                <hr class="separator">
                <table class="up">
                    <tr><td class="label">Bacino:</td><td>${item.basin}</td></tr>
                    <tr><td class="label">Stop ID:</td><td>${item.stop_id}</td></tr>
                </table>
            </div>
        </div>
    `;
}

function plotStops(data) {
    if (!Array.isArray(data) || data.length === 0) {
        showStatus('Nessuna fermata da mostrare.');
        return;
    }
    hideStatus();

    const seenVehicles = new Set();

    data.forEach(item => {
        const key = item.stop_code;
        if (!key) return;
        seenVehicles.add(key);

        const marker = L.marker([item.stop_lat, item.stop_lon], { icon: stopIcon() })
            .bindPopup(stopPopupHtml(item));

        marker.on('popupopen', (e) => {
            loadLines(item.stop_code, item.basin, e.popup);
        });

        marker.addTo(stopsLayerGroup);
        markersByStop.set(key, marker);
    });

    for (const [key, marker] of markersByStop.entries()) {
        if (!seenVehicles.has(key)) {
            stopsLayerGroup.removeLayer(marker);
            markersByStop.delete(key);
        }
    }

    if (markersByStop.size > 0 && MODE == "stops") {
        if (!userLocationFound) {
            //Se il GPS non è concesso utilizza zoom sulle città base
            switch (BASIN) {
                case "RA":
                    map.setView([44.413, 12.205], CONFIG.STOPS_DEF_ZOOM);
                    break;
                case "FC":
                    map.setView([44.138, 12.245], CONFIG.STOPS_DEF_ZOOM);
                    break;
                case "RN":
                    map.setView([44.058, 12.57], CONFIG.STOPS_DEF_ZOOM);
                    break;
            }
        }
    }

    //SOLO SHAPES MODE
    //Aggiunge alla mappa le fermate, altrimenti non verrebbero spawnate le fermate (non serve stop visibility)
    if (!map.hasLayer(stopsLayerGroup) && MODE != "stops") {
        stopsLayerGroup.addTo(map);
    }
}

async function loadStops() {
    const stopListUrl = CONFIG.BASE_URL + CONFIG.STOP_LIST_ENDPOINT.replace('{basin}', encodeURIComponent(BASIN));
    if (!stopListUrl) {
        showStatus('BASE_URL non impostato.');
        return false;
    }
    try {
        const data = await fetchJson(stopListUrl);
        plotStops(data);
        return true;
    } catch (err) {
        console.error('Errore nel fetch dei mezzi:', err);
        showStatus('Errore nel caricamento dati live: ' + err);
        return false;
    }
}

async function initStopsMode() {
    const position = await locateUser();
    userLocationFound = !!position; //userLocationFound: variabile globale

    if (position) {
        //Se il GPS è disponibile, setta zoom e posizione sull'utente
        showUserLocation(position.lat, position.lon);
        map.setView([position.lat, position.lon], CONFIG.GEOLOCATION_ZOOM);
    }
    //Se non è disponibile, lo zoom di default scatta dentro loadStops()

    const success = await loadStops();
    if (success) {
        //A ogni zoom aggiorna la visibilità per protezione performance se dezoomi troppo
        map.on('zoomend', updateStopsVisibility);
        updateStopsVisibility();
    }
}

// ======================================================================
// MODALITÀ: SHAPES
// ======================================================================

function shapeEndpointIcon(color, type) {
    const symbol = type === 'start' ? 'Inizio' : 'Fine';
    return L.divIcon({
        className: '',
        html: `<div class="shape-endpoint-icon ${type}" style="background:${color}">${symbol}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
}

function shapeEndpointPopupHtml(shapeId, type) {
    const label = type === 'start' ? 'Inizio tracciato' : 'Fine tracciato';
    return `
        <div class="popup-content">
            <div class="popup-head shape-popup-head">
                <h3>${label}</h3>
            </div>
            <div class="popup-base shape-popup-base">
                Shape ID: ${shapeId}
            </div>
        </div>
    `;
}

async function loadShapeData(shapeId, basin) {
    if (!CONFIG.BASE_URL) {
        throw new Error('BASE_URL non impostato');
    }

    let url
    if (BASIN == undefined) {
        url = CONFIG.BASE_URL + CONFIG.SHAPE_ENDPOINT_TEMPLATE.replace('{basin}', basin).replace('{shapeId}', shapeId);
    } else {
        url = CONFIG.BASE_URL + CONFIG.SHAPE_ENDPOINT_TEMPLATE.replace('{basin}', BASIN).replace('{shapeId}', shapeId);
    }
    return fetchJson(url);
}

//This stores all markers for start and end of shape
let layerGroup = L.layerGroup().addTo(map);

async function initShapesMode(shapeid, basin) {
    const allPolylineLayers = [];
    const shapeIdToColor = {};
    let anyError = false;

    if (shapeid == undefined) {
        if (SHAPE_IDS.length === 0) {
            showStatus('Nessuno shapeId specificato. Usa ?mode=shapes&basin=FC&shapeId=8003_A (o una lista separata da virgole).');
            return;
        }
        for (let i = 0; i < SHAPE_IDS.length; i++) {
            const shapeId = SHAPE_IDS[i];
            const color = SHAPE_COLORS[i % SHAPE_COLORS.length];
            shapeIdToColor[shapeId] = color;

            try {
                const data = await loadShapeData(shapeId);
                let points = data?.points ?? [];
                if (!Array.isArray(points) || points.length === 0) {
                    console.warn('Nessun punto ricevuto per ' + shapeId);
                    continue;
                }
                points = [...points].sort((a, b) => (a.shape_pt_sequence ?? 0) - (b.shape_pt_sequence ?? 0));

                const latlngs = points
                    .filter(p => typeof p.shape_pt_lat === 'number' && typeof p.shape_pt_lon === 'number')
                    .map(p => [p.shape_pt_lat, p.shape_pt_lon]);

                if (latlngs.length === 0) continue;

                const polyline = L.polyline(latlngs, {
                    color: color,
                    weight: 5,
                    opacity: 0.85
                })

                polyline.addTo(map);
                allPolylineLayers.push(polyline);

                // Marker di inizio e fine per capire il verso del tracciato
                const startMarker = L.marker(latlngs[0], { icon: shapeEndpointIcon(color, 'start') })
                    .bindPopup(shapeEndpointPopupHtml(shapeId, 'start'));
                const endMarker = L.marker(latlngs[latlngs.length - 1], { icon: shapeEndpointIcon(color, 'end') })
                    .bindPopup(shapeEndpointPopupHtml(shapeId, 'end'));
                startMarker.addTo(map);
                endMarker.addTo(map);
                allPolylineLayers.push(startMarker, endMarker);

                //Spawna le fermate interessate sullo shape (tutti i trip_id con quella shape)
                plotStops(data.stops)
            } catch (err) {
                console.error('Errore nel caricamento dello shape ' + shapeId + ':', err);
                anyError = true;
            }
        }
    } else {
        const color = SHAPE_COLORS[0];
        shapeIdToColor[shapeid] = color;
        try {
            const data = await loadShapeData(shapeid, basin);
            let points = data?.points ?? [];
            if (!Array.isArray(points) || points.length === 0) {
                console.warn('Nessun punto ricevuto per ' + shapeId);
            }
            points = [...points].sort((a, b) => (a.shape_pt_sequence ?? 0) - (b.shape_pt_sequence ?? 0));

            const latlngs = points
                .filter(p => typeof p.shape_pt_lat === 'number' && typeof p.shape_pt_lon === 'number')
                .map(p => [p.shape_pt_lat, p.shape_pt_lon]);

            const polyline = L.polyline(latlngs, {
                color: color,
                weight: 5,
                opacity: 0.85
            })

            polyline.addTo(map);
            allPolylineLayers.push(polyline);

            const startMarker = L.marker(latlngs[0], { icon: shapeEndpointIcon(color, 'start') })
                .bindPopup(shapeEndpointPopupHtml(shapeid, 'start')).addTo(layerGroup);
            const endMarker = L.marker(latlngs[latlngs.length - 1], { icon: shapeEndpointIcon(color, 'end') })
                .bindPopup(shapeEndpointPopupHtml(shapeid, 'end')).addTo(layerGroup);
            startMarker.addTo(map);
            endMarker.addTo(map);
            allPolylineLayers.push(startMarker, endMarker);

            //Spawna le fermate interessate sullo shape (tutti i trip_id con quella shape)
            plotStops(data.stops)
        } catch (err) {
            console.error('Errore nel caricamento dello shape ' + shapeid + ':', err);
            anyError = true;
        }
    }

    if (allPolylineLayers.length === 0) {
        showStatus('Impossibile caricare i tracciati richiesti.');
        return;
    }

    if (anyError) {
        showStatus('Alcuni tracciati non sono stati caricati correttamente (vedi console).');
    }

    const group = L.featureGroup(allPolylineLayers);
    if (MODE == "shapes") {
        map.fitBounds(group.getBounds().pad(0));
    }
}

// ======================================================================
// AVVIO IN BASE ALLA MODALITÀ
// ======================================================================
async function initApp() {
    try {
        CONFIG.BASE_URL = await getApiUrl();
    } catch (err) {
        console.error('Errore nel resolver HA:', err);
        showStatus('Servizio mappa non raggiungibile al momento.');
        return;
    }

    if (!CONFIG.BASE_URL && MODE !== "empty") {
        showStatus('Servizio mappa non disponibile al momento.');
        return;
    }

    switch (MODE) {
        case "shapes":
            initShapesMode();
            break;
        case "single":
            initSingleMode();
            break;
        case "singlemixed":
            initSingleMixedMode();
            break;
        case "stops":
            initStopsMode();
            break;
        case "empty":
            break;
        default:
            initVehiclesMode();
            break;
    }
}

initApp();

function refreshVehiclePhotos() {
    if (window.ERTPLPhotos) {
        window.ERTPLPhotos.refresh();
    }
}

map.on('popupopen', refreshVehiclePhotos);
map.on('popupclose', () => {
    if (MODE != "singlemixed" && MODE != "single" && MODE != "shapes" && MODE != "stops") {
        clearMap();
        const allTranspMarkers = document.querySelectorAll('.bus-icon-transparent');
        allTranspMarkers.forEach(marker => {
            marker.className = "bus-icon";
        })
        const allLargeTranspMarkers = document.querySelectorAll('.bus-icon-large-transparent');
        allLargeTranspMarkers.forEach(marker => {
            marker.className = "bus-icon-large";
        })
    }
});

function spawnShape(basin, shapeid, popup) {
    //PULIRE DA TUTTE LE SHAPE
    clearMap();

    //Rende tutti i marker eccetto questo meno opachi
    const popupElement = popup.getElement();
    const thisMarker = popupElement.querySelector('.bus-icon');
    const thisLargeMarker = popupElement.querySelector('.bus-icon-large');
    const allMarkers = document.querySelectorAll('.bus-icon');
    const largeMarkers = document.querySelectorAll('.bus-icon-large');
    allMarkers.forEach(marker => {
        marker.className = "bus-icon-transparent";
    })
    largeMarkers.forEach(marker => {
        marker.className = "bus-icon-large-transparent";
    })
    if (thisMarker != null) {
        thisMarker.className = "bus-icon";
    } else {
        thisLargeMarker.className = "bus-icon-large";
    }

    initShapesMode(shapeid, basin);
}

async function loadLines(stopCode, basin, popup) {
    //Gets popup 
    const popupElement = popup.getElement();
    const linesContainer = popupElement.querySelector('.lines-container');
    const url = CONFIG.BASE_URL + CONFIG.STOP_INFO_ENDPOINT.replace('{basin}', basin).replace('{stopCode}', stopCode);

    try {
        const data = await fetchJson(url);
        data.lines.forEach(line => {
            const div = document.createElement('div');
            div.className = "passing-line-box";
            div.innerHTML = `
                ${line.line}
            `;
            linesContainer.style.display = '';
            linesContainer.appendChild(div);
        })
    } catch (err) {
        console.error('Errore nel caricamento linee passanti:', err);
        showStatus('Errore nel caricamento linee passanti: ' + err);
    }
}

function clearMap() {
    for (i in map._layers) {
        if (map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            }
            catch (e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }
    layerGroup.clearLayers();
    stopsLayerGroup.clearLayers();
}