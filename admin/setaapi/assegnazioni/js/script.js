function getValidToken() {
    const token = localStorage.getItem("access_token");
    const expiry = localStorage.getItem("token_expiry");

    if (!token || !expiry || Date.now() > Number(expiry)) {
        return null; // assente o scaduto
    }
    return token;
}

//Checks initial authentication
checkAuth();

function checkAuth() {
    if (!getValidToken()) {
        redirectToLogin();
        return false;
    }
    document.getElementById("loading-container").classList.add("d-none");
    document.getElementById("page-container").classList.remove("d-none");
    return true;
}

//Actual page script
const API_ENDPOINT = "https://ertpl-api.vichingo455.com/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const operationButtonsContainer = document.getElementById('operation-buttons-container');
const viewButtons = document.querySelectorAll('#view-tabs-ul button');
const tableTitle = document.getElementById('table-title');
const searchBarContainer = document.getElementById('search-bar-container');
const searchBar = document.getElementById('search-bar');
const navButtonsContainer = document.getElementById('nav-buttons-container');
const tableContainer = document.getElementById('table-container');

function switchView(mode, element) {
    //Deactivates all tabs
    viewButtons.forEach(button => {
        button.classList.remove("active");
    })
    //Except clicked one
    element.classList.add("active");
    //Hides nav buttons
    navButtonsContainer.classList.add("d-none");
    switch (mode) {
        case "list":
            initList();
            break;
        case "search-vtable":
            initSearchVehicleTable();
            break;
    }
}

//Open assignments view first
switchView("list", document.getElementById('list-button'))

function initList() {
    searchBarContainer.classList.add("d-none");
    tableTitle.textContent = "Assegnazioni:";
    getApiUrl().then(url => fetch(url + "/assignments")
        .then(response => {
            if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
            return response.json();
        })
        .then(data => {
            renderListTable(data);
            currentAssignments = data;
        })
        .catch(err => {
            console.error('Errore nel caricamento dati:', err);
            tableContainer.textContent = 'Errore nel caricamento dati.';
        }));
}

var allresults = [];
function initSearchVehicleTable() {
    tableTitle.textContent = "Cerca tabella oraria:";
    searchBarContainer.classList.remove("d-none");
    searchBar.placeholder = "Caricamento in corso...";
    tableContainer.innerHTML = `
        <div id="results-container" class="text-center"></div>
        <div id="quick-container" class="text-center my-2">
            <hr>
            <h3 class="fw-bold mb-3">Fermate rapide:</h3>
            <a onclick="renderCorsie('MODENA AUTOSTAZIONE')" class="bianco"><div class="search-result"><h4>Autostazione</h4></div></a>
            <a onclick="renderCorsie('STAZIONE FS')" class="bianco"><div class="search-result"><h4>Stazione FS</h4></div></a>
            <a onclick="renderCorsie('GARIBALDI')" class="bianco"><div class="search-result"><h4>Largo Garibaldi</h4></div></a>
        </div>
    `;
    const quickContainer = document.getElementById('quick-container');
    const resultsContainer = document.getElementById('results-container');
    tableContainer.classList.add("d-none");
    tableContainer.classList.remove("border", "border-secondary");
    navButtonsContainer.classList.add("d-none");
    var searching = false;
    var oldTerm;

    getApiUrl().then(url => {
        fetch(url + "/stops")
            .then(response => {
                if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
                return response.json();
            })
            .then(data => {
                allresults = data;
                if (searching) {
                    search(oldTerm);
                }
                searchBar.placeholder = "Cerca una fermata...";
                tableContainer.classList.remove("d-none");
            })
            .catch(error => {
                console.error('Errore nel caricamento dei dati:', error);
                searchBar.placeholder = "Errore nel caricamento lista fermate."
            });
    })

    if (searchBar.value != '') {
        const searchTerm = searchBar.value.trim().toLowerCase();
        search(searchTerm);
    }

    searchBar.addEventListener('input', () => {
        if (searchBar.value == '') {
            resultsContainer.innerHTML = '';
            quickContainer.style.display = '';
        } else {
            const searchTerm = searchBar.value.trim().toLowerCase();
            search(searchTerm);
        }
    });
    // ------------------------
    // - from cercafermata.js -
    // ------------------------

    function renderResults(results) {
        resultsContainer.innerHTML = '';
        //quickContainer.style.display = 'none';
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>Nessun risultato trovato</p>';
            return;
        }

        results.forEach(item => {
            const div = document.createElement('div');
            const a = document.createElement('a');
            a.className = 'bianco';
            a.setAttribute("onclick", `renderArrivals("${item.code}", "${item.name}");`)
            div.className = 'search-result';
            div.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <p>Codice fermata: ${item.code}</p>
                </div>
            `;
            a.appendChild(div);

            resultsContainer.appendChild(a);
        });
    }

    function search(searchTerm) {
        //Filters taking first elements as the one starting with the letters in the search term
        searching = true;
        oldTerm = searchTerm;
        const filtered = allresults
            .filter(item =>
                item.name.toLowerCase().includes(searchTerm)
            )
            .sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();

                const aIndex = aName.indexOf(searchTerm);
                const bIndex = bName.indexOf(searchTerm);

                return aIndex - bIndex;
            });
        renderResults(filtered);
    }

    // END SECTION
}

function renderListTable(item, selectedOption) {
    try {
        if (selectedOption == undefined) {
            tableContainer.innerHTML = '';

            // Creo tabella
            const table = document.createElement('table');
            table.className = "table table-striped w-100 mb-0";

            // Intestazione
            renderListTH(table);

            // Corpo tabella
            const tbody = document.createElement('tbody');
            item.forEach((item, idx) => {
                renderListElement(tbody, item, idx);
            });
            table.appendChild(tbody);

            tableContainer.appendChild(table);
        }
    } catch (err) {
        console.error('Errore nel caricamento dati:', err);
        tableContainer.textContent = 'Errore nel caricamento dati.';
    }
}

function renderListTH(table) {
    const thead = document.createElement('thead');
    thead.innerHTML = `
            <tr>
                <th>Tabella oraria</th>
                <th>Mezzo</th>
                <th>GPS?</th>
                <th></th>
                <th></th>
            </tr>
        `;
    table.appendChild(thead);
}

function renderListElement(tbody, element, idx) {
    const tr = document.createElement('tr');
    if (element.is_GPS) {
        element.is_GPS = "Si";
    } else {
        element.is_GPS = "No";
    }
    tr.innerHTML = `
        <td>${element.vehicle_table}</td>
        <td>${element.vehicle}</td>
        <td>${element.is_GPS}</td>
        <td style="width:36px;">
            <button class="btn btn-outline-primary fw-bold" onclick="openChangeFormPrecTable(${element.vehicle});">
                <i class="bi bi-arrow-repeat"></i>
            </button>
        </td>
        <td style="width:36px;">
            <button class="btn btn-danger fw-bold" onclick="openRemoveFormPrecTable(${element.vehicle_table});">
                <i class="bi bi-trash3-fill"></i>
            </button>
        </td>
    `;
    if (idx % 2 != 0) {
        tr.className = "even";
    }
    tbody.appendChild(tr);
}

// -------------------------
// - search-table arrivals -
// -------------------------

function renderArrivals(code, name) {
    tableContainer.classList.add("text-center");
    tableContainer.innerHTML = 'Caricamento in corso...';
    tableContainer.classList.remove("border", "border-secondary");
    getApiUrl().then(url => {
        fetch(url + "/arrivals/" + code)
            .then(response => {
                if (!response.ok) {
                    if (response.status != 400) {
                        throw new Error("Errore nel caricamento dei dati. HTTP: " + response.status);
                    } else {
                        tableContainer.innerHTML = "Nessuna corsa programmata nei prossimi 90 minuti."
                        searchBarContainer.classList.add("d-none");
                        navButtonsContainer.classList.remove("d-none");
                        const fermOppButton = document.querySelector('button.fermopp');
                        if (fermOppButton) navButtonsContainer.removeChild(fermOppButton);
                        throw new Error("NO ARRIVALS")
                    }
                } else {
                    return response.json();
                }
            })
            .then(data => {
                renderArrTable(data, name, code)
            })
    })
}

function renderArrTable(item, nome, code) {
    try {
        searchBarContainer.classList.add("d-none");
        navButtonsContainer.classList.remove("d-none");
        tableContainer.innerHTML = '';

        tableContainer.classList.add("border", "border-secondary");
        const fermOppButton = document.querySelector('button.fermopp');
        if (fermOppButton) navButtonsContainer.removeChild(fermOppButton);

        //Pulsante dall'altra parte
        getApiUrl().then(url => {
            fetch(url + "/stops")
                .then(response => {
                    if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
                    return response.json();
                })
                .then(data => {
                    allresults = data;
                    const button = document.createElement('button');
                    button.className = "btn btn btn-secondary fw-bold m-1 fermopp";
                    if (altraParteSearch(nome)) {
                        const codes = altraParteSearch(nome);
                        if (code == codes[0]) {
                            altroCodice = codes[1];
                        } else {
                            altroCodice = codes[0];
                        }
                        button.setAttribute("onclick", `renderArrivals("${altroCodice}", "${nome}")`);
                        button.textContent = `Fermata opposta`;
                        //Moved here because otherwise empty buttons would be appended
                        navButtonsContainer.appendChild(button);
                    }
                    //Set corsie per stazione o autostazione
                    if (nome.includes("STAZIONE FS")) {
                        button.setAttribute("onclick", `renderCorsie("STAZIONE FS")`);
                        button.textContent = `Altre corsie`;
                        navButtonsContainer.appendChild(button);
                    }
                    if (nome.includes("MODENA AUTOSTAZIONE")) {
                        button.setAttribute("onclick", `renderCorsie("MODENA AUTOSTAZIONE")`);
                        button.textContent = `Altre corsie`;
                        navButtonsContainer.appendChild(button);
                    }
                    if (nome.includes("GARIBALDI")) {
                        button.setAttribute("onclick", `renderCorsie("GARIBALDI")`);
                        button.textContent = `Altre corsie`;
                        navButtonsContainer.appendChild(button);
                    }
                    if (nome.includes("POLO LEONARDO")) {
                        button.setAttribute("onclick", `renderCorsie("POLO LEONARDO")`);
                        button.textContent = `Altre corsie`;
                        navButtonsContainer.appendChild(button);
                    }
                })
                .catch(error => console.error('Errore nel caricamento dei dati:', error));
        })

        // Creo tabella
        const table = document.createElement('table');
        table.className = "table table-striped w-100 mb-0 text-left";
        tableContainer.classList.remove("text-center");

        // Intestazione
        renderArrTH(table);

        // Corpo tabella
        const tbody = document.createElement('tbody');
        item.arrivals.services.forEach((item, idx) => {
            renderArrElement(tbody, item, idx);
        });
        table.appendChild(tbody);

        tableContainer.appendChild(table);
    } catch (err) {
        console.error('Errore nel caricamento dati:', err);
        tableContainer.textContent = 'Errore nel caricamento dati.';
    }
}

function renderArrTH(table) {
    const thead = document.createElement('thead');
    thead.innerHTML = `
            <tr>
                <th>Linea</th>
                <th>Destinazione</th>
                <th>Tabella</th>
                <th>Orario</th>
                <th>Mezzo</th>
                <th class="mobile-hidden">Prossima fermata</th>
                <th></th>
            </tr>
        `;
    table.appendChild(thead);
}

function renderArrElement(tbody, element, idx) {
    const tr = document.createElement('tr');
    if (element.delay != null) {
        if (element.delay > 0) {
            element.delay = " (+" + element.delay + ")";
        } else {
            element.delay = " (" + element.delay + ")";
        }
    } else {
        element.delay = "";
    }

    var addBtn
    if (element.vehicle == "") {
        addBtn = `
            <td style="width:36px;">
                <button class="btn btn-primary fw-bold" onclick="openAddFormPrecTable(${element.vehicle_table});">
                    <i class="bi bi-plus-square-fill"></i>
                </button>
            </td>
        `;
    } else {
        addBtn = `
            <td style="width:36px;">
                <button class="btn btn-outline-primary fw-bold" onclick="openChangeFormPrecTable(${element.vehicle});">
                    <i class="bi bi-arrow-repeat"></i>
                </button>
            </td>
        `;
    }

    if (!element.next_stop) {
        element.next_stop = "";
    }
    tr.innerHTML = `
        <td>${element.line}</td>
        <td>${element.destination}</td>
        <td>${element.vehicle_table}</td>
        <td>${element.arrival_time}${element.delay}</td>
    `;
    if (element.has_AEP) {
        if (element.state == "realtime") {
            tr.innerHTML += `
                <td class="bus-card-green cursor-pointer" onclick="window.location.href='https://wimb.setaweb.it/qm/index.html?id=${element.vehicle}'">${element.vehicle}</td>
                
            `;
        } else {
            tr.innerHTML += `
                <td class="bus-card-green">${element.vehicle}</td>
            `;
        }
    } else {
        if (element.state == "realtime") {
            tr.innerHTML += `
                <td class="cursor-pointer" onclick="window.location.href='https://wimb.setaweb.it/qm/index.html?id=${element.vehicle}'">${element.vehicle}</td>
                
            `;
        } else {
            tr.innerHTML += `
                <td>${element.vehicle}</td>
            `;
        }
    }

    tr.innerHTML += `
        <td class="mobile-hidden">${element.next_stop}</td>
        ${addBtn}
    `;

    tbody.appendChild(tr);
}

function renderCorsie(location) {
    searchBarContainer.classList.add("d-none");
    navButtonsContainer.classList.remove("d-none");
    const fermOppButton = document.querySelector('button.fermopp');
    if (fermOppButton) navButtonsContainer.removeChild(fermOppButton);
    tableContainer.innerHTML = `
        <div id="results-container" class="text-center"></div>
    `;
    tableContainer.classList.remove("border", "border-secondary");
    const resultsContainer = document.getElementById('results-container');
    if (location == "STAZIONE FS") {
        resultsContainer.innerHTML = `
            <a onclick="renderArrivals('MO6132', '${findStopName(allresults, "MO6132")}');" class="bianco">
                <div class="search-result desc"><h4>Corsia 1</h4><p>Linee: 7</p></div>
            </a>
            <a onclick="renderArrivals('MO6133', '${findStopName(allresults, "MO6133")}');" class="bianco">
                <div class="search-result desc"><h4>Corsia 2</h4><p>Linee: 1, 4, 9, 13</p></div>
            </a>
            <a onclick="renderArrivals('MO6134', '${findStopName(allresults, "MO6134")}');" class="bianco">
                <div class="search-result desc"><h4>Corsia 3</h4><p>Linee: 1, 3, 4, 9</p></div>
            </a>
            <a onclick="renderArrivals('MO6119', '${findStopName(allresults, "MO6119")}');" class="bianco">
                <div class="search-result desc"><h4>Corsia 4</h4><p>Linee: 3, 11, 13</p></div>
            </a>
        `;
    }
    if (location == "MODENA AUTOSTAZIONE") {
        resultsContainer.innerHTML = `
            <a onclick="renderArrivals('MO6121', '${findStopName(allresults, "MO6121")}');" class="bianco">
                <div class="search-result desc"><h4>Direzione Centro</h4><p>Linee: 1, 2, 4, 5, 6, 7, 13</p></div>
            </a>
            <a onclick="renderArrivals('MO5003', '${findStopName(allresults, "MO5003")}');" class="bianco">
                <div class="search-result desc"><h4>Lato Novi Park</h4><p>Linee: 1, 2, 4, 5, 7, 13</p></div>
            </a>
            <div></div>
            <a onclick="renderArrivals('MO6600', '${findStopName(allresults, "MO6600")}');" class="bianco">
                <div class="search-result desc"><h4>Davanti Biglietteria</h4><p>Linee: 6</p></div>
            </a>
            <a onclick="renderArrivals('MO10', '${findStopName(allresults, "MO10")}');" class="bianco">
                <div class="search-result desc"><h4>Fianco Biglietteria</h4><p>Linee: 9, 10</p></div>
            </a>
            <a onclick="renderArrivals('MO6120', '${findStopName(allresults, "MO6120")}');" class="bianco">
                <div class="search-result desc"><h4>Fianco Biglietteria lato Novi Park</h4><p>Linee: 9, 10</p></div>
            </a>
            <hr class="solid">
            <a onclick="renderArrivals('MO3', '${findStopName(allresults, "MO3")}');" class="bianco">
                <div class="search-result"><h4>Corriere corsia 1</h4></div>
            </a>
            <a onclick="renderArrivals('MO303', '${findStopName(allresults, "MO303")}');" class="bianco">
                <div class="search-result"><h4>Corriere corsia 2</h4></div>
            </a>
            <a onclick="renderArrivals('MO342', '${findStopName(allresults, "MO342")}');" class="bianco">
                <div class="search-result"><h4>Corriere corsia 3</h4></div>
            </a>
            <a onclick="renderArrivals('MO344', '${findStopName(allresults, "MO344")}');" class="bianco">
                <div class="search-result"><h4>Corriere corsia 4</h4></div>
            </a>
            <a onclick="renderArrivals('MO350', '${findStopName(allresults, "MO350")}');" class="bianco">
                <div class="search-result"><h4>Corriere corsia 5</h4></div>
            </a>
            <a onclick="renderArrivals('MO346', '${findStopName(allresults, "MO346")}');" class="bianco">
                <div class="search-result"><h4>Corriere corsia 6</h4></div>
            </a>
        `;
    }
    if (location == "GARIBALDI") {
        resultsContainer.innerHTML = `
            <a onclick="renderArrivals('MO5900', '${findStopName(allresults, "MO5900")}');" class="bianco">
                <div class="search-result desc"><h4>Direzione Centro</h4><p>Linee: 4, 7, 8</p></div>
            </a>
            <a onclick="renderArrivals('MO30', '${findStopName(allresults, "MO30")}');" class="bianco">
                <div class="search-result desc"><h4>Direzione Trento Trieste</h4><p>Linee: 4, 7, 8</p></div>
            </a>
            <a onclick="renderArrivals('MO9', '${findStopName(allresults, "MO9")}');" class="bianco">
                <div class="search-result desc"><h4>Lato Caduti in Guerra</h4><p>Linee: 3, 12</p></div>
            </a>
            <a onclick="renderArrivals('MO5111', '${findStopName(allresults, "MO5111")}');" class="bianco">
                <div class="search-result desc"><h4>Storchi direzione Trento Trieste</h4><p>Linee: 2, 3, 12</p></div>
            </a>
            <a onclick="renderArrivals('MO5112', '${findStopName(allresults, "MO5112")}');" class="bianco">
                <div class="search-result desc"><h4>Storchi direzione Centro</h4><p>Linee: 2</p></div>
            </a>
        `;
    }
    if (location == "POLO LEONARDO") {
        resultsContainer.innerHTML = `
            <a onclick="renderArrivals('MO6783', '${findStopName(allresults, "MO6783")}');" class="bianco">
                <div class="search-result"><h4>POLO LEONARDO (Strada)</h4><p>Linee: 1A, 4, 10, 12</p></div>
            </a>
            <a onclick="renderArrivals('MO2928', '${findStopName(allresults, "MO2928")}');" class="bianco">
                <div class="search-result"><h4>POLO LEONARDO 1</h4><p>Linee: 1A, 4, 10, 12</p></div>
            </a>
            <hr class="solid">
            <a onclick="renderArrivals('MO218', '${findStopName(allresults, "MO218")}');" class="bianco">
                <div class="search-result"><h4>Corsia 1</h4><p>Linee: 12, 391</p></div>
            </a>
            <a onclick="renderArrivals('MO228', '${findStopName(allresults, "MO228")}');" class="bianco">
                <div class="search-result"><h4>Corsia 2</h4><p>Linee: 731, 740</p></div>
            </a>
            <a onclick="renderArrivals('MO224', '${findStopName(allresults, "MO224")}');" class="bianco">
                <div class="search-result"><h4>Corsia 3</h4><p>Linee: 815, 820</p></div>
            </a>
            <a onclick="renderArrivals('MO217', '${findStopName(allresults, "MO217")}');" class="bianco">
                <div class="search-result"><h4>Corsie 5, 6, 7</h4><p>Linee: 392, 393</p></div>
            </a>
        `;
    }
}

function altraParteSearch(searchTerm) {
    var dupedCodes = [];
    var i = 0;
    allresults.forEach(element => {
        if (element.name.toLowerCase() == searchTerm.toLowerCase()) {
            dupedCodes[i] = element.code;
            i++;
        }
    });
    if (dupedCodes.length == 2) {
        return dupedCodes;
    } else if (dupedCodes.length == 1) {
        return undefined;
    }
}

function findStopName(item, code) {
    const found = item.find(element => element.code == code);
    return found ? found.name : false;
}