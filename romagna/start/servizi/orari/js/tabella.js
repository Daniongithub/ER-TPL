const API_ENDPOINT = 'https://ertpl-ha.cfw.serverissimo.com/start';

const params = new URLSearchParams(window.location.search);
const basin = params.get('basin');
const routeCode = params.get('routecode');

const lineLabel = document.getElementById('linea-span');
const directionContainer = document.getElementById('as-di-container');
const directionButtons = directionContainer.querySelectorAll('button');
const filterContainer = document.getElementById('filter-container');
const filterSelect = document.getElementById('filter-select');
const tableContainer = document.getElementById('table-container');
const infoContainer = document.getElementById('info-container');

let activeRequest;
let trips = [];
let rows = [];

async function fetchJson(url, signal) {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

async function loadTimetable(direction) {
    activeRequest?.abort();
    activeRequest = new AbortController();
    const { signal } = activeRequest;

    for (const button of directionButtons) {
        const selected = button.dataset.direction === direction;
        button.classList.toggle('selected', selected);
        button.setAttribute('aria-pressed', selected);
    }

    filterSelect.selectedIndex = 0;
    infoContainer.replaceChildren();
    tableContainer.textContent = 'Caricamento in corso...';

    try {
        const config = await fetchJson(API_ENDPOINT, signal);
        if (config.status !== 'ok' || !config.url) throw new Error('API START non disponibile');

        const path = [basin, routeCode, direction].map(encodeURIComponent).join('/');
        const data = await fetchJson(`${config.url.replace(/\/+$/, '')}/timetable/${path}`, signal);
        lineLabel.textContent = data.line;
        if (signal.aborted) return;
        if (!Array.isArray(data.trips) || !Array.isArray(data.stops)) {
            throw new Error('Formato orario non valido');
        }

        trips = data.trips.map(({ trip_info: info }) => {
            const line = info.line || info.official_line || routeCode;
            const destination = info.destination;
            return {
                id: info.trip_id,
                line,
                destination,
                shapeId: info.shape_id,
                filterLabel: [line, destination || info.shape_id].filter(Boolean).join(' - '),
                firstRow: -1,
                lastRow: -1
            };
        });
        if (trips.length === 0) {
            tableContainer.textContent = 'Non sono previste corse oggi per questa direzione.';
            return;
        }

        rows = buildRows(data.stops, trips);
        fillFilter();
        renderTimetable();
    } catch (error) {
        if (signal.aborted) return;
        console.error('Errore nel caricamento degli orari:', error);
        tableContainer.textContent = 'Impossibile caricare gli orari.';
    }
}

function buildRows(stops, trips) {
    // L'API ordina i passaggi per stop_sequence. Mantieni quell'ordine per ogni corsa.
    const stopsByTrip = new Map(trips.map(trip => [trip.id, []]));
    for (const stop of stops) {
        stopsByTrip.get(stop.trip_id)?.push(stop);
    }

    let rows = [];
    for (const trip of trips) {
        rows = mergeStops(rows, stopsByTrip.get(trip.id), trip.id);
    }

    rows.forEach((row, index) => {
        for (const trip of trips) {
            if (row.times.has(trip.id)) {
                if (trip.firstRow === -1) trip.firstRow = index;
                trip.lastRow = index;
            }
        }
    });
    return rows;
}

function mergeStops(rows, stops, tripId) {
    // Allinea la sottosequenza comune più lunga per ID. I passaggi che occupano
    // posizioni incompatibili restano su righe distinte, anche per la stessa fermata.
    const matches = Array.from({ length: rows.length + 1 }, () => new Uint32Array(stops.length + 1));
    for (let row = rows.length - 1; row >= 0; row--) {
        for (let stop = stops.length - 1; stop >= 0; stop--) {
            matches[row][stop] = rows[row].stopId === stops[stop].stop_id
                ? 1 + matches[row + 1][stop + 1]
                : Math.max(matches[row + 1][stop], matches[row][stop + 1]);
        }
    }

    const merged = [];
    let row = 0;
    let stop = 0;
    while (row < rows.length || stop < stops.length) {
        if (row < rows.length && stop < stops.length && rows[row].stopId === stops[stop].stop_id) {
            rows[row].times.set(tripId, stops[stop].arrival_time);
            merged.push(rows[row]);
            row++;
            stop++;
        } else if (stop === stops.length ||
            (row < rows.length && matches[row + 1][stop] >= matches[row][stop + 1])) {
            merged.push(rows[row]);
            row++;
        } else {
            const passage = stops[stop];
            merged.push({
                stopId: passage.stop_id,
                name: passage.stop_name,
                times: new Map([[tripId, passage.arrival_time]])
            });
            stop++;
        }
    }
    return merged;
}

function fillFilter() {
    const destinations = new Set(trips.map(trip => trip.filterLabel));
    filterSelect.length = 1;
    for (const label of destinations) {
        filterSelect.add(new Option(label, label));
    }
}

function renderTimetable() {
    const filter = filterSelect.value;
    const visibleTrips = trips.filter(trip => !filter || trip.filterLabel === filter);

    const table = document.createElement('table');
    const header = table.createTHead().insertRow();
    const stopHeader = document.createElement('th');
    stopHeader.scope = 'col';
    stopHeader.textContent = 'Linea e percorso';
    header.appendChild(stopHeader);

    for (const trip of visibleTrips) {
        const cell = document.createElement('th');
        cell.scope = 'col';
        cell.textContent = trip.line;
        if (trip.destination) cell.append(document.createElement('br'), trip.destination);
        if (trip.shapeId) cell.append(document.createElement('br'), `(${trip.shapeId})`);
        header.appendChild(cell);
    }

    const body = table.createTBody();
    rows.forEach((row, index) => {
        if (!visibleTrips.some(trip => row.times.has(trip.id))) return;

        const tableRow = body.insertRow();
        if (tableRow.sectionRowIndex % 2 === 1) tableRow.className = 'even';
        tableRow.insertCell().textContent = row.name;

        for (const trip of visibleTrips) {
            const skipped = index > trip.firstRow && index < trip.lastRow;
            tableRow.insertCell().textContent = row.times.get(trip.id) ?? (skipped ? '|' : '');
        }
    });

    tableContainer.replaceChildren(table);
    const count = document.createElement('p');
    count.textContent = `Totale corse: ${visibleTrips.length}`;
    infoContainer.replaceChildren(count);
}

if (!['RA', 'FC', 'RN'].includes(basin) || !routeCode) {
    directionContainer.style.display = 'none';
    tableContainer.textContent = 'Seleziona un bacino e una linea.';
} else {
    for (const button of directionButtons) {
        button.addEventListener('click', () => loadTimetable(button.dataset.direction));
    }
    filterSelect.addEventListener('change', renderTimetable);
    loadTimetable('0');
}
