const API_ENDPOINT = "https://ertpl-api.vichingo455.com/start";
async function getApiUrl() {
    const res = await fetch(API_ENDPOINT, { cache: 'no-store' });
    if (!res.ok) throw new Error('Registry API non raggiungibile');
    const cfg = await res.json();
    if (cfg.status !== "ok" || !cfg.url) throw new Error('API non disponibile');
    return cfg.url.replace(/\/$/, '');
}

let backend = null;
let loading = false;
let refreshPending = false;
function connectBackend(url) {
    if (typeof EventSource === 'undefined') return;
    const eventsUrl = url + '/events';
    if (backend?.url === eventsUrl) return;
    backend?.close();
    backend = new EventSource(eventsUrl);
    backend.addEventListener('vehicle_positions', fetchVehicle);
    backend.addEventListener('trip_updates', fetchVehicle);
    backend.addEventListener('open', fetchVehicle);
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
}

function isKnown(value) {
    return value != null && String(value).trim() !== '' &&
        String(value).trim().toLowerCase() !== 'sconosciuto';
}

function vehiclePageUrl(path) {
    if (!path) return null;
    try {
        const url = new URL(path, window.location.href);
        return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

const tableContainer = document.getElementById('tabella-container');
const numberSpan = document.getElementById('numero-span');

//Sets vehicle number on heading
numberSpan.textContent = id;

function fetchVehicle() {
    if (!id?.trim()) {
        tableContainer.textContent = 'Specificare il numero del veicolo.';
        return;
    }
    if (loading) {
        refreshPending = true;
        return;
    }
    loading = true;
    return getApiUrl().then(url => {
        connectBackend(url);
        return fetch(url + "/vehicleinfo/" + encodeURIComponent(id), { cache: 'no-store' })
        .then(response => {
            if (!response.ok) {
                if (response.status == 404) {
                    tableContainer.innerHTML = `<strong>Il veicolo non è operativo o non comunica dati.</strong>`;
                    return null;
                }
                throw new Error("Errore nel caricamento dati");
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;
            data.vehicle_info ??= {};
            const busPageUrl = vehiclePageUrl(data.vehicle_info.bus_page_path);
            const table = document.createElement('table');

            //Create table head
            const thead = document.createElement('thead');
            thead.className = 'nosticky';
            thead.innerHTML = `
                <tr>
                    <th colspan="2" style="text-align:center;">Informazioni veicolo:</th>
                </tr>
            `;

            table.appendChild(thead);

            //Create rows
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="uguale">Linea:</td>
                <td class="uguale">${escapeHtml(data.line)}</td>
            `;
            table.appendChild(tr);

            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Direzione:</td>
                <td>${escapeHtml(data.destination)}</td>
            `;
            tr.className = 'even';
            table.appendChild(tr);

            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Bacino linea:</td>
                <td>${escapeHtml(data.basin)}</td>
            `;
            table.appendChild(tr);

            //Refactors delay (+ if positive)
            const delay = data.next_stop?.delay;
            const formattedDelay = delay > 0 ? '+' + delay : (delay ?? 'Sconosciuto');
            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Ritardo/Anticipo: (+/-)</td>
                <td>${escapeHtml(formattedDelay)}</td>
            `;
            tr.className = 'even';
            table.appendChild(tr);

            tr = document.createElement('tr');
            if (busPageUrl) {
                tr.innerHTML = `
                    <td>Numero mezzo:</td>
                    <td><a href="${escapeHtml(busPageUrl)}" target="_blank">${escapeHtml(data.vehicle_info.number)}</a></td>
                `;
            } else {
                tr.innerHTML = `
                    <td>Numero mezzo:</td>
                    <td>${escapeHtml(data.vehicle_info.number)}</td>
                `;
            }
            table.appendChild(tr);

            //Checks if model is null (unknown vehicle)
            if (data.vehicle_info.model == null) {
                data.vehicle_info.model = "Sconosciuto";
            }
            tr = document.createElement('tr');
            if (busPageUrl) {
                tr.innerHTML = `
                    <td>Modello:</td>
                    <td><a href="${escapeHtml(busPageUrl)}" target="_blank">${escapeHtml(data.vehicle_info.model)}</a></td>
                `;
            } else {
                tr.innerHTML = `
                    <td>Modello:</td>
                    <td>${escapeHtml(data.vehicle_info.model)}</td>
                `;
            }
            tr.className = 'even';
            table.appendChild(tr);

            //Checks if plate is null (unknown vehicle)
            if (data.vehicle_info.plate_num == null) {
                data.vehicle_info.plate_num = "Sconosciuto";
            }
            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Targa:</td>
                <td>${escapeHtml(data.vehicle_info.plate_num)}</td>
            `;
            table.appendChild(tr);

            //Checks if basin is null (unknown vehicle)
            if (data.vehicle_info.basin == null) {
                data.vehicle_info.basin = "Sconosciuto";
            }
            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Bacino veicolo:</td>
                <td>${escapeHtml(data.vehicle_info.basin)}</td>
            `;
            tr.className = 'even';
            table.appendChild(tr);

            //Checks if next_stop is null
            if (data.next_stop == null) {
                data.next_stop = {
                    "stop_name": "Sconosciuto",
                    "stop_code": "Sconosciuto",
                    "arrival_time": "Sconosciuto",
                    "delay": "Sconosciuto",
                }
            }
            const stopName = isKnown(data.next_stop.stop_name) ? escapeHtml(data.next_stop.stop_name) : 'Sconosciuto';
            const stopCode = isKnown(data.next_stop.stop_code) ? escapeHtml(data.next_stop.stop_code) : 'Sconosciuto';
            const stopUrl = isKnown(data.next_stop.stop_code) && isKnown(data.basin)
                ? `/romagna/start/servizi/fermate/fermata.html?code=${encodeURIComponent(data.next_stop.stop_code)}&basin=${encodeURIComponent(data.basin)}`
                : null;
            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Prossima fermata:</td>
                <td>${stopUrl && isKnown(data.next_stop.stop_name) ? `<a href="${stopUrl}" target="_blank">${stopName}</a>` : stopName}</td>
            `;
            table.appendChild(tr);

            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Codice fermata:</td>
                <td>${stopUrl ? `<a href="${stopUrl}" target="_blank">${stopCode}</a>` : stopCode}</td>
            `;
            tr.className = 'even';
            table.appendChild(tr);

            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Codice linea:</td>
                <td>${escapeHtml(data.route_id)}</td>
            `;
            table.appendChild(tr);

            tr = document.createElement('tr');
            const shapeUrl = isKnown(data.shape_id) && isKnown(data.basin)
                ? `/romagna/start/servizi/mappa/index.html?mode=shapes&basin=${encodeURIComponent(data.basin)}&shapeId=${encodeURIComponent(data.shape_id)}`
                : null;
            tr.innerHTML = `
                <td>Codice percorso:</td>
                <td>${shapeUrl ? `<a href="${shapeUrl}" target="_blank">${escapeHtml(data.shape_id)}</a>` : 'Sconosciuto'}</td>
            `;
            tr.className = 'even';
            table.appendChild(tr);

            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Codice corsa:</td>
                <td>${escapeHtml(data.trip_id)}</td>
            `;
            table.appendChild(tr);

            //Spawns position only if available
            let nextClass = "even"
            if (data.vehicle_lat != null && data.vehicle_long != null && isKnown(data.basin) && isKnown(data.vehicle_info.number)) {
                tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>Posizione:</td>
                    <td><a href="/romagna/start/servizi/mappa/index.html?mode=single&basin=${encodeURIComponent(data.basin)}&vehicle=${encodeURIComponent(data.vehicle_info.number)}" target="_blank">GPS</a></td>
                `;
                tr.className = 'even';
                nextClass = ""
                table.appendChild(tr);
            }

            //Last update
            let ISOdate = new Date(data.last_update);
            const aggiornamento =
                ISOdate.toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }) +
                " " +
                ISOdate.toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });
            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Ultimo aggiornamento:</td>
                <td>${aggiornamento}</td>
            `;
            tr.className = nextClass;
            table.appendChild(tr);

            tableContainer.innerHTML = '';
            tableContainer.appendChild(table);
        });
    }).catch(err => {
        console.error('Errore nel caricamento veicolo:', err);
        let error = tableContainer.querySelector('.load-error');
        if (!error) {
            if (!tableContainer.querySelector('table')) tableContainer.innerHTML = '';
            error = document.createElement('p');
            error.className = 'load-error';
            tableContainer.appendChild(error);
        }
        error.textContent = 'Errore nel caricamento dei dati. Riprova con Aggiorna o attendi il prossimo aggiornamento.';
    }).finally(() => {
        loading = false;
        if (refreshPending) {
            refreshPending = false;
            fetchVehicle();
        }
    });
}

fetchVehicle();
setInterval(fetchVehicle, 30000);
