const API_ENDPOINT = "https://ertpl-api.vichingo455.com/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const lineaSelect = document.getElementById('linea');
const modelloSelect = document.getElementById('modello');
const filterContainer = document.getElementById('filter-container');
const container = document.getElementById('tabella-container');
const assignContainer = document.getElementById('tabella-altri-container');

var allresults = [];
var urlList;
var httpcode;

//URLs

var urlRoutes;
var urlModels;
getApiUrl()
    .catch(err => {
        console.error('Errore nel caricamento dati:', err);
        container.textContent = "Impossibile raggiungere il server alta disponibilità.";
    })
    .then(url => {
        urlList = url + "/busesinservice";
        urlRoutes = url + "/linelist";
        fillSelect();
        caricadati();
    })

//Fetch routes and models and fill the selects
function fillSelect() {
    fetch(urlRoutes)
        .then(response => {
            if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
            return response.json();
        })
        .then(data => {
            allresults = data;
            allresults.forEach(route => {
                const option = document.createElement('option');
                option.value = route;
                option.textContent = route;
                lineaSelect.appendChild(option);
            });
        })
        .catch(error => { console.error('Errore nel caricamento dei dati:', error) });
}

var refreshGeneraleID = setInterval(caricadati, 30000);

function fillModels() {
    const table = document.querySelector('#tabella-container table');

    if (!table || !modelloSelect) return;

    const currentModel = modelloSelect.value;
    const models = new Set();

    table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.getElementsByTagName('td');

        if (cells.length <= 4) return;

        // Il modello viene raccolto indipendentemente dal filtro modello
        const model = cells[3].textContent.trim();

        if (model && model !== "Sconosciuto") {
            models.add(model);
        }
    });

    // Ricrea le option
    modelloSelect.options.length = 1;

    [...models]
        .sort((a, b) => a.localeCompare(b, 'it', {
            sensitivity: 'base'
        }))
        .forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelloSelect.appendChild(option);
        });
}

function caricadati() {
    //Catalogare errore di connessione HA
    if (urlList.includes("http")) {
        fetch(urlList)
            .then(response => {
                httpcode = response.status;
                if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
                return response.json();
            })
            .then(data => {
                item = data.buses;
                //Verifica se ci sono bus in servizio
                if (item.length == 0) {
                    container.innerHTML = "<strong>Nessun bus in è servizio al momento.</strong>";
                } else {
                    renderTable(item);
                    renderAssignTable(data.other_detected);
                }
            })
            .catch(err => {
                console.error('Errore nel caricamento dati:', err);
                //Errore di connessione
                if (httpcode >= "300") {
                    container.textContent = "Impossibile raggiungere l'API. (Codice HTTP:" + httpcode + ")";
                    return;
                } if (err.message == "NetworkError when attempting to fetch resource.") {
                    container.textContent = "Impossibile raggiungere l'API.";
                    return;
                }
                container.textContent = 'Errore nel caricamento dati.';
            });
    }
}

function renderTable(item) {
    try {
        container.innerHTML = '';

        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
        renderTH(table);

        // Corpo tabella
        const tbody = document.createElement('tbody');
        item.forEach((item, idx) => {
            renderElement(tbody, item, idx);
        });
        table.appendChild(tbody);

        container.appendChild(table);
        fillModels();
    } catch (err) {
        console.error('Errore nel caricamento dati:', err);
        container.textContent = 'Errore nel caricamento dati.';
    }
}

function renderTH(table) {
    const thead = document.createElement('thead');
    thead.innerHTML = `
            <tr>
                <th>Linea</th>
                <th>Direzione</th>
                <th>Veicolo</th>
                <th>Modello</th>
                <th>Prossima fermata</th>
            </tr>
        `;
    table.appendChild(thead);
}

function renderElement(tbody, element, idx) {
    const tr = document.createElement('tr');
    if (element.next_stop == null) {
        var posizione = "";
    } else {
        var posizione = element.next_stop;
    }
    if (element.has_problems) {
        tr.innerHTML = `
            <td style="display: none;">${element.official_line}</td>
            <td class="bus-card-red cursor-pointer" onclick="window.location.href='/seta_modena/servizi/cercaorario/notizielinea.html?routenum=${element.official_line}'">${element.line}</td>
            <td class="bus-card-red cursor-pointer" onclick="window.location.href='/seta_modena/servizi/cercaorario/notizielinea.html?routenum=${element.official_line}'">${element.destination}</td>
        `;
    } else {
        tr.innerHTML = `
            <td style="display: none;">${element.official_line}</td>
            <td>${element.line}</td>
            <td>${element.destination}</td>
        `;
    }
    if (element.has_AEP) {
        tr.innerHTML += `
            <td class="bus-card-green cursor-pointer" onclick="window.location.href='/seta_modena/servizi/businservizio/infoveicolo.html?id=${element.vehicle}'">${element.vehicle}</td>
        `;
    } else {
        tr.innerHTML += `
            <td class="cursor-pointer" onclick="window.location.href='/seta_modena/servizi/businservizio/infoveicolo.html?id=${element.vehicle}'">${element.vehicle}</td>
        `;
    }
    tr.innerHTML += `
        <td>${element.model}</td>
        <td>${posizione}</td>
    `;
    if (idx % 2 != 0) {
        tr.className = "even";
    }
    tbody.appendChild(tr);
}

function renderAssignTable(assignments) {
    try {
        assignContainer.innerHTML = '';

        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
        renderAssignTH(table);

        // Corpo tabella
        const tbody = document.createElement('tbody');
        assignments.forEach((item, idx) => {
            renderAssignElement(tbody, item, idx);
        });
        table.appendChild(tbody);

        assignContainer.appendChild(table);
        fillModels();
    } catch (err) {
        console.error('Errore nel caricamento dati:', err);
        assignContainer.textContent = 'Errore nel caricamento dati.';
    }
}

function renderAssignTH(table) {
    const thead = document.createElement('thead');
    thead.innerHTML = `
            <tr>
                <th>Linea (probabile)</th>
                <th>Veicolo</th>
                <th>Numero tabella</th>
            </tr>
        `;
    table.appendChild(thead);
}

function renderAssignElement(tbody, element, idx) {
    const tr = document.createElement('tr');
    if (element.vehicle_table.substring(1, element.vehicle_table.length - 1).length > 2) {
        probableLine = "-";
    } else {
        probableLine = element.vehicle_table.substring(1, element.vehicle_table.length - 1);
    }
    tr.innerHTML = `
        <td>${probableLine}</td>
        <td>${element.vehicle}</td>
        <td>${element.vehicle_table}</td>
    `;
    if (idx % 2 != 0) {
        tr.className = "even";
    }
    tbody.appendChild(tr);
}

//FILTRI
var intervalFiltrati = 0;
//Filtro per linea
lineaSelect.addEventListener('change', function (event) {
    if (intervalFiltrati != undefined) {
        clearInterval(intervalFiltrati);
        modelloSelect.value = "ph";
    }
    const selectedOption = event.target.value;
    //caricaFiltratiLinea(selectedOption);
    //intervalFiltrati = setInterval(function dummyFunc() { caricaFiltratiLinea(selectedOption); }, 30000);
    clearInterval(refreshGeneraleID);
    applyFilter();
    if (document.getElementById("reimposta-filtro") == undefined) {
        const reimpostaFiltro = document.createElement('p');
        reimpostaFiltro.setAttribute("style", "margin-bottom: 0; font-size: 20px;");
        reimpostaFiltro.setAttribute("id", "reimposta-filtro");
        reimpostaFiltro.innerHTML = `
                <button onclick="window.location.reload()">Reimposta il filtro</a>
            `;
        filterContainer.appendChild(reimpostaFiltro);
    }
});

//Filtro per modello
modelloSelect.addEventListener('change', function (event) {
    if (intervalFiltrati != undefined) {
        clearInterval(intervalFiltrati);
        lineaSelect.value = "ph";
    }
    const selectedOption = event.target.value;
    //caricaFiltratiModello(selectedOption);
    //intervalFiltrati = setInterval(function dummyFunc() { caricaFiltratiModello(selectedOption); }, 30000);
    clearInterval(refreshGeneraleID);
    applyFilter();
    if (document.getElementById("reimposta-filtro") == undefined) {
        const reimpostaFiltro = document.createElement('p');
        reimpostaFiltro.setAttribute("style", "margin-bottom: 0; font-size: 14px;");
        reimpostaFiltro.setAttribute("id", "reimposta-filtro");
        reimpostaFiltro.innerHTML = `
                <button onclick="window.location.reload()">Reimposta il filtro</a>
            `;
        filterContainer.appendChild(reimpostaFiltro);
    }
});

function applyFilter() {
    const filterLinea = lineaSelect.value.toLowerCase();
    const filterModello = modelloSelect.value.toLowerCase();
    const table = document.querySelector('#tabella-container table');
    const tableAss = document.querySelector('#tabella-altri-container table');
    if (!table) return;
    if (!tableAss) return;

    const rows = table.querySelectorAll('tbody tr');
    const rowsAss = tableAss.querySelectorAll('tbody tr');
    let i = 0;

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        let match = true;

        // LINEA
        if (cells[0] && !(cells[0].textContent.toLowerCase() == filterLinea) && filterLinea != "ph") {
            match = false;
        }

        // MODELLO
        if (cells[4] && !(cells[4].textContent.toLowerCase() == filterModello) && filterModello != "ph") {
            match = false;
        }

        row.style.display = match ? '' : 'none';

        if (match) {
            i++;
            row.className = i % 2 === 0 ? 'even' : '';
        }
    });

    i = 0;
    rowsAss.forEach(row => {
        const cells = row.getElementsByTagName('td');
        let match = true;

        // LINEA
        if (cells[0] && !(cells[0].textContent.toLowerCase() == filterLinea) && filterLinea != "ph") {
            match = false;
        }

        row.style.display = match ? '' : 'none';

        if (match) {
            i++;
            row.className = i % 2 === 0 ? 'even' : '';
        }
    });

    // Aggiorna i modelli disponibili usando SOLO Bacino + Linea
    fillModels();

    // Contenitore della tabella
    const container = table.parentElement;

    // Cerca un eventuale messaggio già presente
    let noResults = container.querySelector('.no-results');

    if (i === 0) {
        // Nasconde la tabella, compresa la thead
        table.style.display = 'none';

        // Crea il messaggio se non esiste
        if (!noResults) {
            noResults = document.createElement('h3');
            noResults.className = 'no-results';
            container.appendChild(noResults);
        }

        noResults.textContent = 'Nessun mezzo trovato.';
        noResults.style.display = '';
    } else {
        // Ci sono risultati: mostra la tabella
        table.style.display = '';

        // Nasconde il messaggio
        if (noResults) {
            noResults.style.display = 'none';
        }
    }
}