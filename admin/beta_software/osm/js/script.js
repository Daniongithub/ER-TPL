// ======================================================================
// CONFIGURAZIONE GENERALE (modificabile)
// ======================================================================
const CONFIG = {
    // URL base dell'API. Ogni modalità aggiunge il proprio path/parametri.
    BASE_URL: "https://startapi.serverissimo.com",

    // Path per la modalità "vehicles", aggiunto a BASE_URL.
    VEHICLES_ENDPOINT: "/vehiclepositions",

    // Template per la modalità "shapes": {shapeId} viene sostituito col valore richiesto.
    SHAPE_ENDPOINT_TEMPLATE: "/shape/{shapeId}",

    // Template per la modalità "shapes": {shapeId} viene sostituito col valore richiesto.
    SINGLE_VEHICLE_ENDPOINT: "/vehicleposition/{vehicle}",

    // Intervallo di refresh dati, in millisecondi. Usato solo in modalità "vehicles".
    REFRESH_INTERVAL_MS: 30000,

    // Vista iniziale della mappa (usata finché non arrivano dati da adattare)
    INITIAL_CENTER: [44.42, 12.2],
    INITIAL_ZOOM: 11
};

// Palette colori per distinguere più shape sulla stessa mappa
const SHAPE_COLORS = ["#e53935", "#1e88e5", "#43a047", "#fb8c00", "#8e24aa", "#00897b", "#c0ca33", "#d81b60", "#3949ab", "#6d4c41"];

// ======================================================================
// QUERY PARAMS
// ======================================================================
// ?mode=vehicles              -> mostra i mezzi in tempo reale
// ?mode=shapes&shapeId=8003_A -> mostra un singolo tracciato
// ?mode=shapes&shapeId=8003_A,8003_B,8004_C -> più tracciati, colori diversi
const params = new URLSearchParams(window.location.search);
const MODE = (params.get('mode') || 'vehicles').toLowerCase();
const SHAPE_IDS = (params.get('shapeId') || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
const VEHICLE_ID = params.get('vehicle')

// ======================================================================
// MAPPA
// ======================================================================
const map = L.map('map').setView(CONFIG.INITIAL_CENTER, CONFIG.INITIAL_ZOOM);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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
    return L.divIcon({
        className: '',
        html: `<div class="bus-icon">${item.line}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17]
    });
}

function vehiclePopupHtml(item) {
    let imgAlt = "Caricamento in corso..."
    let divImgClass = " bgtransparent"
    let delayMess = "Ritardo:"
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
        imgAlt = "Anteprima non disponibile."
        divImgClass = ""
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
                <div class="head-desc dispflex">
                    <h3 style="color:white;">${delayMess} ${item.next_stop.delay}</h3>
                    <h3 style="display:flex; flex:1; justify-content:right;">Veicolo: ${item.vehicle_info.number}</h3>
                </div>
            </div>
            <div class="popup-base">
                <table class="up">
                    <tr><td class="label">Bacino:</td><td>${item.basin}</td></tr>
                    <tr><td class="label">Codice percorso:</td><td>${item.shape_id}</td></tr>
                    <tr><td class="label">Codice corsa:</td><td>${item.trip_id}</td></tr>
                </table>
                <hr class="separator">
                <table class="down">
                    <tr><td class="label">Modello:</td><td>${item.vehicle_info.model}</td></tr>
                    <tr><td class="label">Targa:</td><td>${item.vehicle_info.plate_num}</td></tr>
                    <tr><td class="label">Bacino veicolo:</td><td>${item.vehicle_info.basin}</td></tr>
                </table>
                <div class="bus-image-container${divImgClass}">
                    <img src="https://ertpl-cdn.daninet.freeddns.org/img?path=${item.vehicle_info.bus_preview_path}&crop=true"alt="${imgAlt}">
                </div>
                <hr class="separator">
                <table class="up">
                    <tr><td class="label">Prossima fermata:</td><td>${item.next_stop.stop_name}</td></tr>
                    <tr><td class="label">Codice fermata:</td><td>${item.next_stop.stop_code}</td></tr>
                    <tr><td class="label">${delayMess}</td><td>${item.next_stop.delay}</td></tr>
                    <tr><td class="label">ETA:</td><td>${item.next_stop.arrival_time}</td></tr>
                </table>
            </div>
        </div>
    `;
}
/*
<a href="https://ertpl-cdn.daninet.freeddns.org/img?path=${item.vehicle_info.bus_preview_path}">
    <img src="https://ertpl-cdn.daninet.freeddns.org/img?path=${item.vehicle_info.bus_preview_path}&crop=true"alt="${imgAlt}">
</a>
*/

const markersByVehicle = new Map();
let vehiclesFirstLoad = true;

function plotVehicles(data, padd) {
    if (!Array.isArray(data) || data.length === 0) {
        showStatus('Nessun mezzo da mostrare.');
        return;
    }
    hideStatus();

    const seenVehicles = new Set();

    data.forEach(item => {
        const key = item.vehicle ?? item.trip_id;
        if (!key) return;
        seenVehicles.add(key);

        const existing = markersByVehicle.get(key);
        if (existing) {
            existing.setLatLng([item.vehicle_lat, item.vehicle_long]);
            existing.setPopupContent(vehiclePopupHtml(item));
        } else {
            const marker = L.marker([item.vehicle_lat, item.vehicle_long], { icon: busIcon(item) })
                .bindPopup(vehiclePopupHtml(item));
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
    const url = CONFIG.BASE_URL ? (CONFIG.BASE_URL + CONFIG.VEHICLES_ENDPOINT) : "";
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
// MODALITÀ: SHAPES
// ======================================================================
function shapePopupHtml(shapeId, points) {
    const basin = points[0]?.basin ?? '-';
    return `
				<div class="popup-content">
					<h3>Tracciato ${shapeId}</h3>
					<table>
					<tr><td class="label">Bacino:</td><td>${basin}</td></tr>
					<tr><td class="label">Punti:</td><td>${points.length}</td></tr>
					</table>
				</div>
			`;
}

function shapeEndpointIcon(color, type) {
    // type: 'start' -> cerchio verde con ▶, 'end' -> quadrato rosso con ⏹
    const symbol = type === 'start' ? '▶' : '⏹';
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
					<h3>${label}</h3>
					<table>
					<tr><td class="label">Shape ID:</td><td>${shapeId}</td></tr>
					</table>
				</div>
			`;
}

function buildLegend(shapeIdToColor) {
    const entries = Object.entries(shapeIdToColor);
    if (entries.length <= 1) {
        legendEl.style.display = 'none';
        return;
    }
    legendEl.innerHTML = entries.map(([id, color]) => `
				<div class="legend-item">
					<span class="legend-swatch" style="background:${color}"></span>
					<span>${id}</span>
				</div>
    		`).join('');
    legendEl.style.display = 'block';
}

async function loadShapeData(shapeId) {
    if (!CONFIG.BASE_URL) {
        if (FALLBACK_SHAPES[shapeId]) return FALLBACK_SHAPES[shapeId];
        throw new Error('BASE_URL non impostato e nessun fallback per ' + shapeId);
    }
    const url = CONFIG.BASE_URL + CONFIG.SHAPE_ENDPOINT_TEMPLATE.replace('{shapeId}', encodeURIComponent(shapeId));
    return fetchJson(url);
}

async function initShapesMode() {
    if (SHAPE_IDS.length === 0) {
        showStatus('Nessuno shapeId specificato. Usa ?mode=shapes&shapeId=8003_A (o una lista separata da virgole).');
        return;
    }

    const allPolylineLayers = [];
    const shapeIdToColor = {};
    let anyError = false;

    for (let i = 0; i < SHAPE_IDS.length; i++) {
        const shapeId = SHAPE_IDS[i];
        const color = SHAPE_COLORS[i % SHAPE_COLORS.length];
        shapeIdToColor[shapeId] = color;

        try {
            let points = await loadShapeData(shapeId);
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
            }).bindPopup(shapePopupHtml(shapeId, points));

            polyline.addTo(map);
            allPolylineLayers.push(polyline);

            // Marker di inizio (▶) e fine (⏹) per capire il verso del tracciato
            const startMarker = L.marker(latlngs[0], { icon: shapeEndpointIcon(color, 'start') })
                .bindPopup(shapeEndpointPopupHtml(shapeId, 'start'));
            const endMarker = L.marker(latlngs[latlngs.length - 1], { icon: shapeEndpointIcon(color, 'end') })
                .bindPopup(shapeEndpointPopupHtml(shapeId, 'end'));
            startMarker.addTo(map);
            endMarker.addTo(map);
            allPolylineLayers.push(startMarker, endMarker);
        } catch (err) {
            console.error('Errore nel caricamento dello shape ' + shapeId + ':', err);
            anyError = true;
        }
    }

    if (allPolylineLayers.length === 0) {
        showStatus('Impossibile caricare i tracciati richiesti.');
        return;
    }

    if (anyError) {
        showStatus('Alcuni tracciati non sono stati caricati correttamente (vedi console).');
    } else {
        hideStatus();
    }

    buildLegend(shapeIdToColor);

    const group = L.featureGroup(allPolylineLayers);
    map.fitBounds(group.getBounds().pad(0));
}

// ======================================================================
// AVVIO IN BASE ALLA MODALITÀ
// ======================================================================
switch (MODE) {
    case "shapes":
        initShapesMode();
        break;
    case "single":
        initSingleMode();
        break;
    default:
        initVehiclesMode();
        break;
}
