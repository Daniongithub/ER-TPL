const API_ENDPOINT = 'https://ertpl-api.vichingo455.com/seta';
async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

function getValidToken() {
    const token = localStorage.getItem('access_token');
    const expiry = Number(localStorage.getItem('token_expiry'));
    if (!token || !Number.isFinite(expiry) || Date.now() >= expiry) {
        return null;
    }
    return token;
}

function checkAuth() {
    if (!getValidToken()) {
        redirectToLogin();
        return false;
    }
    document.getElementById('loading-container').classList.add('d-none');
    document.getElementById('page-container').classList.remove('d-none');
    return true;
}

const viewButtons = document.querySelectorAll('#view-tabs-ul button');
const tableTitle = document.getElementById('table-title');
const searchBarContainer = document.getElementById('search-bar-container');
const searchBar = document.getElementById('search-bar');
const navButtonsContainer = document.getElementById('nav-buttons-container');
const tableContainer = document.getElementById('table-container');
const assignmentFilters = { vehicle_table: '', vehicle: '' };
const assignmentSort = { column: null, direction: 1 };
const assignmentCollator = new Intl.Collator('it', { numeric: true, sensitivity: 'base' });
let apiUrlPromise = null;
let assignmentsPromise = null;
let stopsPromise = null;
let currentAssignments = [];
let assignmentsLoaded = false;
let allresults = [];
let currentTab = 'list';
let viewVersion = 0;
let activeArrival = null;

async function getApiData(path) {
    const url = await getApiUrl();
    const response = await fetch(url + path);
    if (!response.ok) {
        const error = new Error('Errore nel caricamento dei dati. HTTP: ' + response.status);
        error.status = response.status;
        throw error;
    }
    return response.json();
}

async function loadAssignments() {
    if (!assignmentsPromise) {
        assignmentsPromise = getApiData('/assignments').then(function (data) {
            // L'API restituisce null quando non ci sono assegnazioni.
            if (data === null) {
                data = [];
            }
            if (!Array.isArray(data)) {
                throw new Error('Formato delle assegnazioni non valido.');
            }
            currentAssignments = data;
            assignmentsLoaded = true;
            return data;
        });
    }
    try {
        return await assignmentsPromise;
    } catch (error) {
        assignmentsLoaded = false;
        throw error;
    } finally {
        assignmentsPromise = null;
    }
}

async function loadStops() {
    if (!stopsPromise) {
        stopsPromise = getApiData('/stops').then(function (data) {
            if (!Array.isArray(data)) {
                throw new Error('Formato delle fermate non valido.');
            }
            allresults = data;
            return data;
        });
    }
    try {
        return await stopsPromise;
    } catch (error) {
        stopsPromise = null;
        throw error;
    }
}

function switchView(mode, element) {
    for (const button of viewButtons) {
        button.classList.remove('active');
        button.removeAttribute('aria-current');
    }
    element.classList.add('active');
    element.setAttribute('aria-current', 'page');
    if (mode === 'list') {
        initList();
    } else if (mode === 'search-vtable') {
        initSearchVehicleTable();
    }
}

function prepareView(mode, title) {
    currentTab = mode;
    viewVersion += 1;
    tableTitle.textContent = title;
    tableContainer.classList.remove('d-none', 'text-center');
    tableContainer.classList.add('border', 'border-secondary');
    searchBarContainer.classList.add('d-none');
    navButtonsContainer.classList.add('d-none');
    const oppositeButton = navButtonsContainer.querySelector('.fermopp');
    if (oppositeButton) {
        oppositeButton.remove();
    }
    tableContainer.textContent = 'Caricamento in corso...';
    return viewVersion;
}

function showLoadError(error) {
    tableContainer.classList.remove('border', 'border-secondary');
    tableContainer.replaceChildren();
    const message = document.createElement('p');
    message.className = 'alert alert-danger my-2';
    message.setAttribute('role', 'alert');
    message.textContent = error.message;
    tableContainer.appendChild(message);
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'btn btn-secondary mb-2';
    retry.textContent = 'Riprova';
    retry.addEventListener('click', function () {
        if (currentTab === 'list') {
            initList();
        } else if (currentTab === 'arrivals' && activeArrival) {
            renderArrivals(activeArrival.code, activeArrival.name);
        } else {
            initSearchVehicleTable();
        }
    });
    tableContainer.appendChild(retry);
}

async function initList() {
    const version = prepareView('list', 'Assegnazioni:');
    try {
        await loadAssignments();
        if (version === viewVersion) {
            renderListTable();
        }
    } catch (error) {
        if (version === viewVersion) {
            showLoadError(error);
        }
    }
}

function renderListTable() {
    tableContainer.replaceChildren();
    const table = document.createElement('table');
    table.className = 'table table-striped w-100 mb-0';
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th scope="col" data-sort="vehicle_table" aria-sort="none">
                <button type="button" class="btn border-0 p-0 fw-bold text-body text-nowrap" data-column="vehicle_table">
                    Tabella <i class="bi bi-arrow-down-up ms-1" aria-hidden="true"></i>
                </button>
            </th>
            <th scope="col" data-sort="vehicle" aria-sort="none">
                <button type="button" class="btn border-0 p-0 fw-bold text-body text-nowrap" data-column="vehicle">
                    Mezzo <i class="bi bi-arrow-down-up ms-1" aria-hidden="true"></i>
                </button>
            </th>
            <th scope="col">GPS</th>
            <th scope="col"><span class="visually-hidden">Cambio mezzo</span></th>
            <th scope="col"><span class="visually-hidden">Rimuovi assegnazione</span></th>
        </tr>
        <tr>
            <td><input class="form-control form-control-sm" type="search" data-filter="vehicle_table" aria-label="Filtra tabella oraria" placeholder="Filtra tabella..."></td>
            <td><input class="form-control form-control-sm" type="search" data-filter="vehicle" aria-label="Filtra mezzo" placeholder="Filtra mezzo..."></td>
            <td colspan="3"></td>
        </tr>`;
    for (const button of thead.querySelectorAll('[data-column]')) {
        button.addEventListener('click', function () {
            const column = button.dataset.column;
            if (assignmentSort.column === column) {
                assignmentSort.direction *= -1;
            } else {
                assignmentSort.column = column;
                assignmentSort.direction = 1;
            }
            updateAssignmentRows();
        });
    }
    for (const input of thead.querySelectorAll('[data-filter]')) {
        input.value = assignmentFilters[input.dataset.filter];
        input.addEventListener('input', function () {
            assignmentFilters[input.dataset.filter] = input.value;
            updateAssignmentRows();
        });
    }
    table.appendChild(thead);
    table.appendChild(document.createElement('tbody'));
    tableContainer.appendChild(table);
    updateAssignmentRows();
}

function updateAssignmentRows() {
    const tableFilter = assignmentFilters.vehicle_table.trim().toLowerCase();
    const vehicleFilter = assignmentFilters.vehicle.trim().toLowerCase();
    const assignments = currentAssignments.filter(function (assignment) {
        return String(assignment.vehicle_table).toLowerCase().includes(tableFilter)
            && String(assignment.vehicle).toLowerCase().includes(vehicleFilter);
    });
    if (assignmentSort.column) {
        assignments.sort(function (first, second) {
            return assignmentCollator.compare(String(first[assignmentSort.column]), String(second[assignmentSort.column])) * assignmentSort.direction;
        });
    }
    for (const header of tableContainer.querySelectorAll('[data-sort]')) {
        let order = 'none';
        let icon = 'bi bi-arrow-down-up ms-1';
        if (header.dataset.sort === assignmentSort.column) {
            if (assignmentSort.direction === 1) {
                order = 'ascending';
                icon = 'bi bi-sort-up ms-1';
            } else {
                order = 'descending';
                icon = 'bi bi-sort-down ms-1';
            }
        }
        header.setAttribute('aria-sort', order);
        header.querySelector('i').className = icon;
    }
    const tbody = tableContainer.querySelector('tbody');
    const rows = document.createDocumentFragment();
    for (const assignment of assignments) {
        const row = document.createElement('tr');
        appendCell(row, assignment.vehicle_table);
        appendCell(row, assignment.vehicle);
        let gps = 'No';
        if (assignment.is_GPS === true) {
            gps = 'Sì';
        }
        appendCell(row, gps);
        appendAction(row, 'btn-outline-primary', 'bi-arrow-repeat', 'Cambia mezzo sulla tabella ' + assignment.vehicle_table, function () {
            openChangeFormPrecTable(assignment.vehicle, assignment.vehicle_table);
        });
        appendAction(row, 'btn-danger', 'bi-trash3-fill', 'Rimuovi tabella ' + assignment.vehicle_table, function () {
            openRemoveFormPrecTable(assignment.vehicle_table);
        });
        rows.appendChild(row);
    }
    if (assignments.length === 0) {
        const row = document.createElement('tr');
        const cell = appendCell(row, 'Nessuna assegnazione trovata.');
        cell.colSpan = 5;
        cell.className = 'text-center text-body-secondary py-3';
        rows.appendChild(row);
    }
    tbody.replaceChildren(rows);
}

function appendCell(row, value) {
    const cell = document.createElement('td');
    if (value !== undefined && value !== null) {
        cell.textContent = value;
    }
    row.appendChild(cell);
    return cell;
}

function appendAction(row, style, icon, label, action) {
    const cell = appendCell(row, '');
    cell.className = 'action-cell';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn fw-bold ' + style;
    button.setAttribute('aria-label', label);
    button.title = label;
    const image = document.createElement('i');
    image.className = 'bi ' + icon;
    image.setAttribute('aria-hidden', 'true');
    button.appendChild(image);
    button.addEventListener('click', action);
    cell.appendChild(button);
}

async function initSearchVehicleTable() {
    const version = prepareView('search-vtable', 'Cerca tabella oraria:');
    tableContainer.classList.remove('border', 'border-secondary');
    searchBarContainer.classList.remove('d-none');
    searchBar.disabled = true;
    searchBar.placeholder = 'Caricamento in corso...';
    try {
        await loadStops();
        if (version !== viewVersion) {
            return;
        }
        tableContainer.innerHTML = `
            <div id="results-container" class="row row-cols-1 row-cols-md-4 row-cols-xl-4 g-2 justify-content-center my-2 mx-0"></div>
            <div id="quick-container" class="text-center my-2">
                <hr><h3 class="fw-bold mb-3">Fermate rapide:</h3>
                <div class="row row-cols-1 row-cols-md-4 row-cols-xl-4 g-2 justify-content-center mx-0" id="quick-stops"></div>
            </div>`;
        const quickStops = document.getElementById('quick-stops');
        for (const stop of [
            { name: 'MODENA AUTOSTAZIONE', title: 'Autostazione' },
            { name: 'STAZIONE FS', title: 'Stazione FS' },
            { name: 'GARIBALDI', title: 'Largo Garibaldi' }
        ]) {
            appendSearchCard(quickStops, stop.title, '', function () {
                renderCorsie(stop.name);
            });
        }
        searchBar.disabled = false;
        searchBar.placeholder = 'Cerca una fermata...';
        searchStops();
    } catch (error) {
        if (version === viewVersion) {
            searchBar.placeholder = 'Errore nel caricamento fermate';
            showLoadError(error);
        }
    }
}

function appendSearchCard(container, title, description, action) {
    const column = document.createElement('div');
    column.className = 'col';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-outline-secondary text-body border-2 rounded-3 p-3 w-100 h-100';
    const heading = document.createElement('span');
    heading.className = 'd-block fs-5 fw-bold my-1';
    heading.textContent = title;
    button.appendChild(heading);
    if (description) {
        const text = document.createElement('span');
        text.className = 'd-block small mt-2';
        text.textContent = description;
        button.appendChild(text);
    }
    button.addEventListener('click', action);
    column.appendChild(button);
    container.appendChild(column);
}

function searchStops() {
    if (currentTab !== 'search-vtable') {
        return;
    }
    const results = document.getElementById('results-container');
    if (!results) {
        return;
    }
    results.replaceChildren();
    const term = searchBar.value.trim().toLowerCase();
    if (!term) {
        return;
    }
    const filtered = allresults.filter(function (stop) {
        return stop.name.toLowerCase().includes(term);
    });
    filtered.sort(function (first, second) {
        return first.name.toLowerCase().indexOf(term) - second.name.toLowerCase().indexOf(term);
    });
    for (const stop of filtered) {
        appendSearchCard(results, stop.name, 'Codice fermata: ' + stop.code, function () {
            renderArrivals(stop.code, stop.name);
        });
    }
    if (filtered.length === 0) {
        results.textContent = 'Nessun risultato trovato.';
    }
}

async function renderArrivals(code, name) {
    activeArrival = { code: code, name: name };
    const version = prepareView('arrivals', 'Fermata: ' + name);
    navButtonsContainer.classList.remove('d-none');
    try {
        const data = await getApiData('/arrivals/' + encodeURIComponent(code));
        if (version !== viewVersion) {
            return;
        }
        renderArrTable(data);
        renderStopNavigation(code, name);
    } catch (error) {
        if (version !== viewVersion) {
            return;
        }
        if (error.status === 400) {
            tableContainer.classList.remove('border', 'border-secondary');
            tableContainer.textContent = 'Nessuna corsa programmata nei prossimi 90 minuti.';
            renderStopNavigation(code, name);
        } else {
            showLoadError(error);
        }
    }
}

function renderStopNavigation(code, name) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-secondary fw-bold m-1 fermopp';
    for (const location of Object.keys(QUICK_STOPS)) {
        if (name.includes(location)) {
            button.textContent = 'Altre corsie';
            button.addEventListener('click', function () {
                renderCorsie(location);
            });
            navButtonsContainer.appendChild(button);
            return;
        }
    }
    const oppositeStops = allresults.filter(function (stop) {
        return stop.name.toLowerCase() === name.toLowerCase();
    });
    if (oppositeStops.length === 2) {
        const opposite = oppositeStops.find(function (stop) {
            return stop.code !== code;
        });
        if (opposite) {
            button.textContent = 'Fermata opposta';
            button.addEventListener('click', function () {
                renderArrivals(opposite.code, opposite.name);
            });
            navButtonsContainer.appendChild(button);
        }
    }
}

function renderArrTable(data) {
    const table = document.createElement('table');
    table.className = 'table table-striped w-100 mb-0';
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th scope="col">Linea</th>
            <th scope="col">Destinazione</th>
            <th scope="col">Tabella</th>
            <th scope="col">Percorso</th>
            <th scope="col">Orario</th>
            <th scope="col">Mezzo</th>
            <th scope="col" class="d-none d-sm-table-cell">Prossima fermata</th>
            <th scope="col"><span class="visually-hidden">Modifica assegnazione</span></th>
        </tr>`;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    for (const service of data.arrivals.services) {
        const row = document.createElement('tr');
        appendCell(row, service.line);
        appendCell(row, service.destination);
        appendCell(row, service.vehicle_table);
        appendCell(row, service.journey_code.split("-")[2]);
        let delay = '';
        if (service.delay !== null && service.delay !== undefined) {
            if (service.delay > 0) {
                delay = ' (+' + service.delay + ')';
            } else {
                delay = ' (' + service.delay + ')';
            }
        }
        appendCell(row, service.arrival_time + delay);
        const vehicleCell = appendCell(row, service.vehicle);
        if (service.has_AEP) {
            vehicleCell.classList.add('bus-card-green');
        }
        if (service.state === 'realtime' && service.vehicle) {
            const link = document.createElement('a');
            link.className = 'text-body text-decoration-none d-block';
            link.href = 'https://wimb.setaweb.it/qm/index.html?id=' + encodeURIComponent(service.vehicle);
            link.textContent = service.vehicle;
            vehicleCell.replaceChildren(link);
        }
        appendCell(row, service.next_stop).className = 'd-none d-sm-table-cell';
        if (!service.vehicle) {
            appendAction(row, 'btn-primary', 'bi-plus-square-fill', 'Aggiungi tabella ' + service.vehicle_table, function () {
                openAddFormPrecTable(service.vehicle_table);
            });
        } else {
            appendAction(row, 'btn-outline-primary', 'bi-arrow-repeat', 'Cambia mezzo sulla tabella ' + service.vehicle_table, function () {
                openChangeFormPrecTable(service.vehicle, service.vehicle_table);
            });
        }
        tbody.appendChild(row);
    }
    if (tbody.children.length === 0) {
        const cell = appendCell(tbody.appendChild(document.createElement('tr')), 'Nessuna corsa programmata nei prossimi 90 minuti.');
        cell.colSpan = 7;
    }
    table.appendChild(tbody);
    tableContainer.replaceChildren(table);
}

function renderCorsie(location) {
    prepareView('platforms', 'Corsie: ' + location);
    navButtonsContainer.classList.remove('d-none');
    tableContainer.classList.remove('border', 'border-secondary');
    const results = document.createElement('div');
    results.className = 'row row-cols-1 row-cols-md-4 row-cols-xl-4 g-2 justify-content-center my-2 mx-0';
    for (const stop of QUICK_STOPS[location]) {
        if (stop.newRow || stop.separatorBefore) {
            const separator = document.createElement('div');
            separator.className = 'w-100';
            if (stop.separatorBefore) {
                separator.appendChild(document.createElement('hr'));
            }
            results.appendChild(separator);
        }
        appendSearchCard(results, stop.title, stop.description, function () {
            const found = allresults.find(function (item) {
                return item.code === stop.code;
            });
            let name = stop.title;
            if (found) {
                name = found.name;
            }
            renderArrivals(stop.code, name);
        });
    }
    tableContainer.replaceChildren(results);
}

searchBar.addEventListener('input', searchStops);

const QUICK_STOPS = {
    "STAZIONE FS": [
        {
            "code": "MO6132",
            "title": "Corsia 1",
            "description": "Linee: 7"
        },
        {
            "code": "MO6133",
            "title": "Corsia 2",
            "description": "Linee: 1, 4, 9, 13"
        },
        {
            "code": "MO6134",
            "title": "Corsia 3",
            "description": "Linee: 1, 3, 4, 9"
        },
        {
            "code": "MO6119",
            "title": "Corsia 4",
            "description": "Linee: 3, 11, 13"
        }
    ],
    "MODENA AUTOSTAZIONE": [
        {
            "code": "MO6121",
            "title": "Direzione Centro",
            "description": "Linee: 1, 2, 4, 5, 6, 7, 13"
        },
        {
            "code": "MO5003",
            "title": "Lato Novi Park",
            "description": "Linee: 1, 2, 4, 5, 7, 13"
        },
        {
            "code": "MO6600",
            "title": "Davanti Biglietteria",
            "description": "Linee: 6",
            "newRow": true
        },
        {
            "code": "MO10",
            "title": "Fianco Biglietteria",
            "description": "Linee: 9, 10"
        },
        {
            "code": "MO6120",
            "title": "Fianco Biglietteria lato Novi Park",
            "description": "Linee: 9, 10"
        },
        {
            "code": "MO3",
            "title": "Corriere corsia 1",
            "description": "",
            "separatorBefore": true
        },
        {
            "code": "MO303",
            "title": "Corriere corsia 2",
            "description": ""
        },
        {
            "code": "MO342",
            "title": "Corriere corsia 3",
            "description": ""
        },
        {
            "code": "MO344",
            "title": "Corriere corsia 4",
            "description": ""
        },
        {
            "code": "MO350",
            "title": "Corriere corsia 5",
            "description": ""
        },
        {
            "code": "MO346",
            "title": "Corriere corsia 6",
            "description": ""
        }
    ],
    "GARIBALDI": [
        {
            "code": "MO5900",
            "title": "Direzione Centro",
            "description": "Linee: 4, 7, 8"
        },
        {
            "code": "MO30",
            "title": "Direzione Trento Trieste",
            "description": "Linee: 4, 7, 8"
        },
        {
            "code": "MO9",
            "title": "Lato Caduti in Guerra",
            "description": "Linee: 3, 12"
        },
        {
            "code": "MO5111",
            "title": "Storchi direzione Trento Trieste",
            "description": "Linee: 2, 3, 12"
        },
        {
            "code": "MO5112",
            "title": "Storchi direzione Centro",
            "description": "Linee: 2"
        }
    ],
    "POLO LEONARDO": [
        {
            "code": "MO6783",
            "title": "POLO LEONARDO (Strada)",
            "description": "Linee: 1A, 4, 10, 12"
        },
        {
            "code": "MO2928",
            "title": "POLO LEONARDO 1",
            "description": "Linee: 1A, 4, 10, 12"
        },
        {
            "code": "MO218",
            "title": "Corsia 1",
            "description": "Linee: 12, 391",
            "separatorBefore": true
        },
        {
            "code": "MO228",
            "title": "Corsia 2",
            "description": "Linee: 731, 740"
        },
        {
            "code": "MO224",
            "title": "Corsia 3",
            "description": "Linee: 815, 820"
        },
        {
            "code": "MO217",
            "title": "Corsie 5, 6, 7",
            "description": "Linee: 392, 393"
        }
    ]
};

if (checkAuth()) {
    initList();
}
