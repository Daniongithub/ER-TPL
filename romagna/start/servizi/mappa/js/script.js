const API_ENDPOINT = "https://ertpl-api.vichingo455.com/start";
async function getApiUrl() {
    const res = await fetch(API_ENDPOINT, { cache: "no-store" });
    if (!res.ok) throw new Error('Registry HA non raggiungibile: ' + res.status);
    const cfg = await res.json();
    if (cfg.status !== "ok" || !cfg.url) return null;
    return cfg.url;
}

// ======================================================================
// CONFIGURAZIONE GENERALE
// ======================================================================

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
const VEHICLE_ID = params.get('vehicle')?.trim();
const BASIN = params.get('basin')?.trim();

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
const statusMessages = new Map();

function updateStatus() {
    statusEl.textContent = Array.from(statusMessages.values()).join(' ');
    statusEl.style.display = statusMessages.size > 0 ? 'block' : 'none';
}

function showStatus(msg, source = 'general') {
    statusMessages.set(source, msg);
    updateStatus();
}

function hideStatus(source = 'general') {
    statusMessages.delete(source);
    updateStatus();
}

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Risposta non ok: ' + res.status);
    return res.json();
}

function escapeHtml(value) {
    return String(value ?? 'Sconosciuto').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
}

function validCoordinates(lat, lon) {
    const isNumeric = value => (typeof value === 'number' ||
        (typeof value === 'string' && value.trim() !== '')) && Number.isFinite(Number(value));
    return isNumeric(lat) && isNumeric(lon) &&
        Math.abs(Number(lat)) <= 90 && Math.abs(Number(lon)) <= 180;
}

// ======================================================================
// MODALITÀ: VEHICLES
// ======================================================================
function busIcon(item) {
    const line = String(item.line ?? '?');
    if (item.line == "MetroMare") {
        return L.divIcon({
            className: '',
            html: `<div class="bus-icon-large">${escapeHtml(line.split(" ")[0])}</div>`,
            iconSize: [34, 34],
            iconAnchor: [50, 17],
            popupAnchor: [0, -17]
        });
    } else {
        return L.divIcon({
            className: '',
            html: `<div class="bus-icon">${escapeHtml(line.split(" ")[0])}</div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -17]
        });
    }

}

function vehiclePopupHtml(item) {
    const vehicleInfo = item.vehicle_info ?? {};
    const nextStop = item.next_stop ?? {};
    let delayMess = "";
    let delay = "";
    let imgHtml = "";
    if (vehicleInfo.bus_preview_path == null) {
        imgHtml = `
            <div class="bus-image-container">
                <span>Anteprima non disponibile.</span>
            </div>
        `;
    } else {
        imgHtml = `
            <div class="bus-image-container bgtransparent">
                <img data-path="${escapeHtml(vehicleInfo.bus_preview_path)}" data-crop="true" alt="Caricamento in corso...">
            </div>
        `;
    }
    if (nextStop.delay != null && nextStop.delay !== '' && Number.isFinite(Number(nextStop.delay))) {
        if (Number(nextStop.delay) < 0) {
            delayMess = "Anticipo:";
            delay = Math.abs(Number(nextStop.delay)) + " MIN";
        } else if (Number(nextStop.delay) === 0) {
            delayMess = "In orario";
        } else {
            delayMess = "Ritardo:";
            delay = Number(nextStop.delay) + " MIN";
        }
    }
    const routeParams = new URLSearchParams({
        mode: 'singlemixed', vehicle: vehicleInfo.number ?? '',
        basin: item.basin ?? '', shapeId: item.shape_id ?? ''
    });
    return `
        <div class="popup-content">
            <div class="popup-head">
                <div class="dispflex">
                    <div class="line-box">${escapeHtml(item.line)}</div>
                    <div class="dest-box">${escapeHtml(item.destination)}</div>
                </div>
                <hr class="head-separator">
                <div class="head-desc">
                    <div class="dispflex">
                        <h3 style="color:white;">${delayMess} ${delay}</h3>
                        <h3 style="display:flex; flex:1; justify-content:right;">Veicolo: ${escapeHtml(vehicleInfo.number)}</h3>
                    </div>
                </div>
            </div>
            <div class="popup-base">
                <table class="up">
                    <tr><td class="label">Bacino:</td><td>${escapeHtml(item.basin)}</td></tr>
                    <tr><td class="label">Codice percorso:</td><td>${escapeHtml(item.shape_id)}</td></tr>
                    <tr><td class="label">Codice corsa:</td><td>${escapeHtml(item.trip_id)}</td></tr>
                </table>
                <a class="button" href="?${escapeHtml(routeParams)}">Visualizza il percorso</a>
                <hr class="separator">
                <table class="down">
                    <tr><td class="label">Modello:</td><td>${escapeHtml(vehicleInfo.model)}</td></tr>
                    <tr><td class="label">Targa:</td><td>${escapeHtml(vehicleInfo.plate_num)}</td></tr>
                    <tr><td class="label">Bacino veicolo:</td><td>${escapeHtml(vehicleInfo.basin)}</td></tr>
                </table>
                ${imgHtml}
                <hr class="separator">
                <table class="up">
                    <tr><td class="label">Prossima fermata:</td><td>${escapeHtml(nextStop.stop_name)}</td></tr>
                    <tr><td class="label">Codice fermata:</td><td>${escapeHtml(nextStop.stop_code)}</td></tr>
                    <tr><td class="label">ETA:</td><td>${escapeHtml(nextStop.arrival_time)}</td></tr>
                </table>
            </div>
        </div>
    `;
}

function resizeVehiclePopup(popup) {
    if (popup.options.className !== 'vehicle-popup' || !popup.isOpen()) return false;
    const element = popup.getElement();
    const content = element.querySelector('.leaflet-popup-content');
    const line = element.querySelector('.line-box');
    const destination = element.querySelector('.dest-box');
    if (!content || !line || !destination) return false;

    const row = line.parentElement;
    const text = document.createRange();
    text.selectNodeContents(line);
    const overflows = () => {
        const box = line.getBoundingClientRect();
        const label = text.getBoundingClientRect();
        return label.left < box.left || label.right > box.right ||
            destination.scrollWidth > destination.clientWidth;
    };

    // Misura sempre da 301 px, anche se prima il popup aveva una destinazione più lunga.
    let width = 301;
    content.style.width = width + 'px';
    if (overflows()) {
        const padding = content.getBoundingClientRect().width - row.getBoundingClientRect().width;
        const oldWidth = row.style.width;
        const oldWhiteSpace = row.style.whiteSpace;
        row.style.width = 'max-content';
        row.style.whiteSpace = 'nowrap';
        let upper = Math.ceil(row.getBoundingClientRect().width + padding) + 1;
        row.style.width = oldWidth;
        row.style.whiteSpace = oldWhiteSpace;

        // Cerca la larghezza minima che conserva tutte le lettere della linea.
        while (upper - width > 1) {
            const middle = Math.floor((width + upper) / 2);
            content.style.width = middle + 'px';
            if (overflows()) width = middle;
            else upper = middle;
        }
        width = upper;
    }
    content.style.width = width + 'px';
    // Leaflet aggiunge un pixel alla larghezza impostata nelle opzioni del popup.
    if (popup.options.minWidth === width - 1 && popup.options.maxWidth === width - 1) return false;
    popup.options.minWidth = popup.options.maxWidth = width - 1;
    popup.update();
    return true;
}

function refreshVehiclePopup(popup) {
    resizeVehiclePopup(popup);
    refreshVehiclePhotos();
    if (popup.options.className === 'vehicle-popup' && document.fonts?.status === 'loading') {
        document.fonts.ready.then(() => {
            if (resizeVehiclePopup(popup)) refreshVehiclePhotos();
        });
    }
}

const markersByVehicle = new Map();
const markersByStop = new Map();
const lineRequestsByPopup = new WeakMap();
let vehiclesFirstLoad = true;
let vehiclesLoading = false;
let singleLoading = false;
let activeShapeMarker = null;

function updateVehicleOpacity() {
    for (const marker of markersByVehicle.values()) {
        marker.setOpacity(activeShapeMarker && marker !== activeShapeMarker ? 0.5 : 1);
    }
}

function plotVehicles(data, padd) {
    if (!Array.isArray(data)) {
        showStatus('Dati dei mezzi non validi.', 'vehicles');
        return;
    }
    // Una risposta temporaneamente priva di posizioni non cancella l'ultima posizione nota.
    if (!vehiclesFirstLoad && data.length > 0 && data.every(item => item == null)) {
        showStatus('Il mezzo ha smesso di comunicare la sua posizione.', 'vehicles');
        return;
    }

    const seenVehicles = new Set();

    //Lost vehicle for a second
    if (!vehiclesFirstLoad && data[0] == null) {
        showStatus('Il mezzo ha smesso di comunicare la sua posizione.');
        return;
    } else {
        hideStatus('');
    }

    data.forEach(item => {
        if (!item || !validCoordinates(item.vehicle_lat, item.vehicle_long)) return;
        const number = item.vehicle_info?.number;
        if (number == null && !item.trip_id) return;
        const key = number != null ? `vehicle:${number}` : `trip:${item.basin}:${item.trip_id}`;
        seenVehicles.add(key);

        const existing = markersByVehicle.get(key);
        if (existing) {
            const previous = existing.options.vehicleData;
            existing.options.vehicleData = item;
            existing.setLatLng([item.vehicle_lat, item.vehicle_long]);
            existing.setIcon(busIcon(item));
            existing.setPopupContent(vehiclePopupHtml(item));
            if (existing === activeShapeMarker &&
                (previous.shape_id !== item.shape_id || previous.basin !== item.basin)) {
                spawnShape(item.basin, item.shape_id, existing);
            }
            // Caso 2: il popup era già aperto e il contenuto (quindi anche l'img) è stato appena sostituito
            if (existing.isPopupOpen()) {
                refreshVehiclePopup(existing.getPopup());
            }
        } else {
            const marker = L.marker([item.vehicle_lat, item.vehicle_long], {
                icon: busIcon(item), vehicleData: item
            }).bindPopup(vehiclePopupHtml(item), {
                className: 'vehicle-popup',
                minWidth: 300,
                maxWidth: 300,
                // Il bus resta aperto mentre si consultano le fermate del suo percorso.
                autoClose: MODE === 'singlemixed',
                closeOnClick: MODE === 'singlemixed'
            });

            //Se siamo nella modalità single mixed, questa funzione non deve partire
            if (MODE != "singlemixed") {
                marker.on('popupopen', () => {
                    const current = marker.options.vehicleData;
                    spawnShape(current.basin, current.shape_id, marker);
                });
                marker.on('popupclose', () => {
                    if (activeShapeMarker === marker) {
                        activeShapeMarker = null;
                        clearMap();
                        updateVehicleOpacity();
                    }
                });
            }

            marker.addTo(map);
            markersByVehicle.set(key, marker);
        }
    });

    let selectedVehicleLost = false;
    for (const [key, marker] of markersByVehicle.entries()) {
        if (!seenVehicles.has(key)) {
            if (marker === activeShapeMarker) selectedVehicleLost = true;
            map.removeLayer(marker);
            markersByVehicle.delete(key);
        }
    }
    updateVehicleOpacity();
    if (selectedVehicleLost) {
        showStatus('Il mezzo ha smesso di comunicare la sua posizione.', 'vehicles');
    } else if (markersByVehicle.size === 0) {
        showStatus('Nessun mezzo con posizione disponibile.', 'vehicles');
    } else {
        hideStatus('vehicles');
    }
    if (markersByVehicle.size === 0) {
        return;
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
    if (vehiclesLoading) return;
    if (!CONFIG.BASE_URL) {
        showStatus('BASE_URL non impostato.', 'vehicles');
        return;
    }
    let url
    if (BASIN) {
        url = CONFIG.BASE_URL + CONFIG.VEHICLES_BASIN_ENDPOINT.replace('{basin}', encodeURIComponent(BASIN));
    } else {
        url = CONFIG.BASE_URL ? (CONFIG.BASE_URL + CONFIG.VEHICLES_ENDPOINT) : "";
    }
    if (!url) {
        showStatus('BASE_URL non impostato.', 'vehicles');
        return;
    }
    vehiclesLoading = true;
    try {
        const data = await fetchJson(url);
        plotVehicles(data, 0);
    } catch (err) {
        console.error('Errore nel fetch dei mezzi:', err);
        showStatus('Errore nel caricamento dati live: ' + err, 'vehicles');
    } finally {
        vehiclesLoading = false;
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
    if (singleLoading) return;
    if (!CONFIG.BASE_URL) {
        showStatus('BASE_URL non impostato.', 'vehicles');
        return;
    }
    if (!VEHICLE_ID) {
        showStatus('Nessun veicolo specificato. Usa il parametro vehicle.', 'vehicles');
        return;
    }
    const url = CONFIG.BASE_URL + CONFIG.SINGLE_VEHICLE_ENDPOINT.replace('{vehicle}', encodeURIComponent(VEHICLE_ID));
    singleLoading = true;
    try {
        const data = await fetchJson(url);
        if (!data || !validCoordinates(data.vehicle_lat, data.vehicle_long)) {
            showStatus(vehiclesFirstLoad ? 'GPS veicolo non disponibile.' :
                'Il mezzo ha smesso di comunicare la sua posizione.', 'vehicles');
            return;
        }
        plotVehicles([data], 13);
    } catch (err) {
        console.error('Errore nel fetch dei mezzi:', err);
        showStatus('Errore nel caricamento dati live: ' + err, 'vehicles');
    } finally {
        singleLoading = false;
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
    return loadSingle();
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
    const stopParams = new URLSearchParams({ code: item.stop_code ?? '', basin: item.basin ?? '' });
    return `
        <div class="popup-content">
            <div class="popup-head">
                <div class="dispflex">
                    <div class="stop-name-box">${escapeHtml(item.stop_name)}</div>
                </div>
                <hr class="head-separator">
                <div class="head-desc">
                    <div class="dispflex stop-code-box">
                        Codice fermata: ${escapeHtml(item.stop_code)}
                    </div>
                </div>
            </div>
            <div class="popup-base">
                <a class="button" href="/romagna/start/servizi/fermate/fermata.html?${escapeHtml(stopParams)}" target="_blank">Visualizza gli arrivi</a>
                <hr class="separator">
                <h3 style="text-align: center;">Che cosa passa oggi?</h3>
                <div class="lines-container" style="display: none;"></div>
                <hr class="separator">
                <table class="up">
                    <tr><td class="label">Bacino:</td><td>${escapeHtml(item.basin)}</td></tr>
                    <tr><td class="label">Stop ID:</td><td>${escapeHtml(item.stop_id)}</td></tr>
                </table>
            </div>
        </div>
    `;
}

function plotStops(data, replace = true) {
    if (!Array.isArray(data)) {
        showStatus('Dati delle fermate non validi.');
        return;
    }

    const seenStops = new Set();

    data.forEach(item => {
        if (!item || item.stop_code == null || !validCoordinates(item.stop_lat, item.stop_lon)) return;
        const key = `${item.basin}:${item.stop_code}`;
        seenStops.add(key);

        const existing = markersByStop.get(key);
        if (existing) {
            existing.options.stopData = item;
            existing.setLatLng([item.stop_lat, item.stop_lon]);
            existing.setPopupContent(stopPopupHtml(item));
            if (existing.isPopupOpen()) loadLines(item.stop_code, item.basin, existing.getPopup());
            return;
        }

        const marker = L.marker([item.stop_lat, item.stop_lon], { icon: stopIcon(), stopData: item })
            .bindPopup(stopPopupHtml(item));

        marker.on('popupopen', (e) => {
            const current = marker.options.stopData;
            loadLines(current.stop_code, current.basin, e.popup);
        });

        marker.addTo(stopsLayerGroup);
        markersByStop.set(key, marker);
    });

    for (const [key, marker] of markersByStop.entries()) {
        if (replace && !seenStops.has(key)) {
            stopsLayerGroup.removeLayer(marker);
            markersByStop.delete(key);
        }
    }
    if (MODE === 'stops') {
        if (markersByStop.size === 0) showStatus('Nessuna fermata da mostrare.');
        else hideStatus();
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
    if (!CONFIG.BASE_URL) {
        showStatus('BASE_URL non impostato.');
        return false;
    }
    const stopListUrl = CONFIG.BASE_URL + CONFIG.STOP_LIST_ENDPOINT.replace('{basin}', encodeURIComponent(BASIN));
    try {
        const data = await fetchJson(stopListUrl);
        plotStops(data);
        return Array.isArray(data) && markersByStop.size > 0;
    } catch (err) {
        console.error('Errore nel fetch delle fermate:', err);
        showStatus('Errore nel caricamento delle fermate: ' + err);
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
                Shape ID: ${escapeHtml(shapeId)}
            </div>
        </div>
    `;
}

async function loadShapeData(shapeId, basin) {
    if (!CONFIG.BASE_URL) {
        throw new Error('BASE_URL non impostato');
    }

    const shapeBasin = basin || BASIN;
    if (!shapeBasin || !shapeId) throw new Error('Bacino o shapeId non specificato');
    const url = CONFIG.BASE_URL + CONFIG.SHAPE_ENDPOINT_TEMPLATE
        .replace('{basin}', encodeURIComponent(shapeBasin))
        .replace('{shapeId}', encodeURIComponent(shapeId));
    return fetchJson(url);
}

// Tracciati e capolinea: la pulizia agisce solo sui layer gestiti da queste funzioni.
const layerGroup = L.layerGroup().addTo(map);
let shapeRequestId = 0;

async function initShapesMode(shapeid, basin) {
    const allPolylineLayers = [];
    const shapeIds = shapeid == undefined ? SHAPE_IDS : [shapeid];
    const requestId = shapeRequestId;
    let anyError = false;

    if (shapeIds.length === 0) {
        showStatus('Nessuno shapeId specificato. Usa ?mode=shapes&basin=FC&shapeId=8003_A (o una lista separata da virgole).', 'shapes');
        return;
    }
    for (let i = 0; i < shapeIds.length; i++) {
        const shapeId = shapeIds[i];
        const color = SHAPE_COLORS[i % SHAPE_COLORS.length];
        try {
            const data = await loadShapeData(shapeId, basin);
            // Una chiusura o un cambio bus invalida i caricamenti precedenti.
            if (requestId !== shapeRequestId) return;
            let points = data?.points ?? [];
            if (!Array.isArray(points) || points.length === 0) {
                console.warn('Nessun punto ricevuto per ' + shapeId);
                anyError = true;
                continue;
            }
            points = points.filter(p => p && validCoordinates(p.shape_pt_lat, p.shape_pt_lon))
                .sort((a, b) => (a.shape_pt_sequence ?? 0) - (b.shape_pt_sequence ?? 0));

            const latlngs = points.map(p => [p.shape_pt_lat, p.shape_pt_lon]);
            if (latlngs.length === 0) {
                anyError = true;
                continue;
            }

            const polyline = L.polyline(latlngs, {
                color: color,
                weight: 5,
                opacity: 0.85
            }).addTo(layerGroup);
            allPolylineLayers.push(polyline);

            // Marker di inizio e fine per capire il verso del tracciato.
            const startMarker = L.marker(latlngs[0], { icon: shapeEndpointIcon(color, 'start') })
                .bindPopup(shapeEndpointPopupHtml(shapeId, 'start')).addTo(layerGroup);
            const endMarker = L.marker(latlngs[latlngs.length - 1], { icon: shapeEndpointIcon(color, 'end') })
                .bindPopup(shapeEndpointPopupHtml(shapeId, 'end')).addTo(layerGroup);
            allPolylineLayers.push(startMarker, endMarker);

            // Accumula le fermate di tutti i percorsi senza duplicare quelle condivise.
            const stops = Array.isArray(data.stops) ? data.stops : [];
            plotStops(stops.map(stop => stop && ({ ...stop, basin: stop.basin ?? basin ?? BASIN })), false);
        } catch (err) {
            if (requestId !== shapeRequestId) return;
            console.error('Errore nel caricamento dello shape ' + shapeId + ':', err);
            anyError = true;
        }
    }

    if (allPolylineLayers.length === 0) {
        showStatus('Impossibile caricare i tracciati richiesti.', 'shapes');
        return;
    }

    if (anyError) {
        showStatus('Alcuni tracciati non sono stati caricati correttamente (vedi console).', 'shapes');
    } else {
        hideStatus('shapes');
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
    if (MODE === 'empty') return;
    if ((MODE === 'single' || MODE === 'singlemixed') && !VEHICLE_ID) {
        showStatus('Nessun veicolo specificato. Usa il parametro vehicle.');
        return;
    }
    if (['stops', 'shapes', 'singlemixed'].includes(MODE) && !BASIN) {
        showStatus('Nessun bacino specificato. Usa il parametro basin.');
        return;
    }
    try {
        CONFIG.BASE_URL = await getApiUrl();
    } catch (err) {
        console.error('Errore nel resolver HA:', err);
        showStatus('Servizio mappa non raggiungibile al momento.');
        return;
    }

    if (!CONFIG.BASE_URL) {
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

map.on('popupopen', e => refreshVehiclePopup(e.popup));
// I click sui marker sono gestiti dai loro popup; un click sulla mappa chiude il bus.
map.on('click', () => {
    if (activeShapeMarker) activeShapeMarker.closePopup();
});

function spawnShape(basin, shapeid, marker) {
    if (activeShapeMarker && activeShapeMarker !== marker) {
        activeShapeMarker.closePopup();
    }
    clearMap();
    activeShapeMarker = marker;
    updateVehicleOpacity();
    if (!shapeid || !(basin || BASIN)) {
        showStatus('Percorso del veicolo non disponibile.', 'shapes');
        return;
    }
    initShapesMode(shapeid, basin);
}

async function loadLines(stopCode, basin, popup) {
    const popupElement = popup.getElement();
    const popupContent = popupElement?.querySelector('.popup-content');
    const linesContainer = popupContent?.querySelector('.lines-container');
    if (!linesContainer) return;
    // Con una stringa HTML, update() ricreerebbe il DOM cancellando le linee caricate.
    // Conservare il nodo permette a Leaflet di aggiornare il layout senza perdere i dati.
    popup.setContent(popupContent);
    const request = {};
    lineRequestsByPopup.set(popup, request);
    const isCurrentRequest = () => lineRequestsByPopup.get(popup) === request && popup.getContent() === popupContent;
    const url = CONFIG.BASE_URL + CONFIG.STOP_INFO_ENDPOINT
        .replace('{basin}', encodeURIComponent(basin)).replace('{stopCode}', encodeURIComponent(stopCode));
    const noLinesMessage = 'Nessuna linea passa per questa fermata.';

    // Svuota il contenitore per evitare duplicati
    linesContainer.innerHTML = '';
    linesContainer.style.display = '';

    try {
        const data = await fetchJson(url);
        if (!isCurrentRequest()) return;
        const groups = [
            {
                key: 'urban',
                title: basin === 'RA' ? 'Linee urbane e suburbane:' : 'Linee urbane:'
            },
            {
                key: 'suburban',
                title: 'Linee suburbane:'
            },
            {
                key: 'exurban',
                title: 'Linee extraurbane:'
            },
            {
                key: 'school',
                title: 'Linee scolastiche:'
            },
            {
                key: 'shuttle',
                title: 'Linee navetta:'
            }
        ];

        let hasLines = false;

        groups.forEach(group => {
            const lines = data?.[group.key];

            // Non mostrare le categorie assenti o vuote
            if (!Array.isArray(lines) || lines.length === 0) {
                return;
            }

            hasLines = true;

            const groupDiv = document.createElement('div');
            groupDiv.className = 'passing-lines-group';

            const title = document.createElement('h3');
            title.textContent = group.title;
            groupDiv.appendChild(title);

            lines.forEach(line => {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'passing-line-box';
                lineDiv.textContent = line.line;

                groupDiv.appendChild(lineDiv);
            });

            linesContainer.appendChild(groupDiv);
        });

        if (!hasLines) {
            linesContainer.textContent = noLinesMessage;
        }
    } catch (err) {
        if (!isCurrentRequest()) return;
        console.error('Errore nel caricamento linee passanti:', err);
        linesContainer.innerHTML = '';
        linesContainer.textContent = 'Impossibile caricare le linee di questa fermata.';
    }
    if (popup.isOpen()) popup.update();
}

function clearMap() {
    shapeRequestId++;
    hideStatus('shapes');
    layerGroup.clearLayers();
    stopsLayerGroup.clearLayers();
    markersByStop.clear();
}
