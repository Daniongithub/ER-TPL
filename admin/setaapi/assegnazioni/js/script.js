function getValidToken() {
    const token = sessionStorage.getItem("access_token");
    const expiry = sessionStorage.getItem("token_expiry");

    if (!token || !expiry || Date.now() > Number(expiry)) {
        return null; // assente o scaduto
    }
    return token;
}

//Checks initial authentication
checkAuth()

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
        })
        .catch(err => {
            console.error('Errore nel caricamento dati:', err);
            tableContainer.textContent = 'Errore nel caricamento dati.';
        }));
}

function initSearchVehicleTable() {
    tableTitle.textContent = "Cerca tabella oraria:";
    searchBarContainer.classList.remove("d-none");
    searchBar.placeholder = "Caricamento in corso...";
    tableContainer.innerHTML = `
        <div id="results-container" class="text-center"></div>
    `;
    tableContainer.classList.remove("border", "border-secondary");
    navButtonsContainer.classList.add("d-none");
    const resultsContainer = document.getElementById('results-container');
    //const quickContainer = document.getElementById('quick-container');
    var searching = false;
    var oldTerm;
    var allresults = [];

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
            })
            .catch(error => console.error('Errore nel caricamento dei dati:', error));
    })

    if (searchBar.value != '') {
        const searchTerm = searchBar.value.trim().toLowerCase();
        search(searchTerm);
    }

    searchBar.addEventListener('input', () => {
        if (searchBar.value == '') {
            resultsContainer.innerHTML = '';
            //quickContainer.style.display = '';
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
                    <h3>${item.name}</h3>
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
                <th>Posizione?</th>
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
            <button class="btn btn-outline-primary fw-bold" onclick="openChangeFormPrecTable();">
                <i class="bi bi-arrow-repeat"></i>
            </button>
        </td>
        <td style="width:36px;">
            <button class="btn btn-danger fw-bold" onclick="openRemoveFormPrecTable();">
                <i class="bi bi-trash3-fill"></i>
            </button>
        </td>
    `;
    if (idx % 2 != 0) {
        tr.className = "even";
    }
    tbody.appendChild(tr);
}

// --------------------------
// - search-vtable arrivals -
// --------------------------

function renderArrivals(code, name) {
    tableContainer.classList.add("text-center");
    tableContainer.innerHTML = 'Caricamento in corso...';
    getApiUrl().then(url => {
        fetch(url + "/arrivals/" + code)
            .then(response => {
                if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
                return response.json();
            })
            .then(data => {
                renderArrTable(data, name, code)
            })
    })
}

function renderArrTable(item, nome, code) {
    try {
        searchBarContainer.classList.add("d-none")
        navButtonsContainer.classList.remove("d-none")
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
                    if (altraParteSearch(nome)) {
                        const codes = altraParteSearch(nome);
                        if (code == codes[0]) {
                            altroCodice = codes[1];
                        } else {
                            altroCodice = codes[0];
                        }
                        button.className = "btn btn btn-secondary fw-bold m-1 fermopp"
                        button.setAttribute("onclick", `renderArrivals("${altroCodice}", "${nome}")`)
                        button.textContent = `Fermata opposta`;
                    }
                    //Set corsie per stazione o autostazione
                    if (nome.includes("STAZIONE FS")) {
                        button.className = "btn btn btn-secondary fw-bold m-1 fermopp"
                        button.setAttribute("onclick", `renderCorsie("STAZIONE FS")`)
                        button.textContent = `Altre corsie`;
                    }
                    if (nome.includes("MODENA AUTOSTAZIONE")) {
                        button.className = "btn btn btn-secondary fw-bold m-1 fermopp"
                        button.setAttribute("onclick", `renderCorsie("MODENA AUTOSTAZIONE")`)
                        button.textContent = `Altre corsie`;
                    }
                    if (nome.includes("GARIBALDI")) {
                        button.className = "btn btn btn-secondary fw-bold m-1 fermopp"
                        button.setAttribute("onclick", `renderCorsie("GARIBALDI")`)
                        button.textContent = `Altre corsie`;
                    }
                    if (nome.includes("POLO LEONARDO")) {
                        button.className = "btn btn btn-secondary fw-bold m-1 fermopp"
                        button.setAttribute("onclick", `renderCorsie("POLO LEONARDO")`)
                        button.textContent = `Altre corsie`;
                    }
                    navButtonsContainer.appendChild(button)
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
                <th>Tabella oraria</th>
                <th>Orario (Rit/Ant):</th>
                <th>Mezzo</th>
                <th></th>
                <th></th>
            </tr>
        `;
    table.appendChild(thead);
}

function renderArrElement(tbody, element, idx) {
    const tr = document.createElement('tr');
    if (element.delay != null) {
        if (element.delay > 0) {
            element.delay = " (+" + element.delay + ")"
        } else {
            element.delay = " (" + element.delay + ")"
        }
    } else {
        element.delay = "";
    }
    var addBtn
    if(element.vehicle == "") {
        addBtn = `
            <td style="width:36px;">
                <button class="btn btn-primary fw-bold" onclick="openAddFormPrecTable();">
                    <i class="bi bi-plus-square-fill"></i>
                </button>
            </td>
        `;
    } else {
        addBtn = `
            <td style="width:36px;">
                <button class="btn btn-outline-primary fw-bold" onclick="openChangeFormPrecTable();">
                    <i class="bi bi-arrow-repeat"></i>
                </button>
            </td>
        `;
    }
    tr.innerHTML = `
        <td>${element.line}</td>
        <td>${element.destination}</td>
        <td>${element.vehicle_table}</td>
        <td>${element.arrival_time}${element.delay}</td>
        <td>${element.vehicle}</td>
        ${addBtn}
    `;
    if (idx % 2 != 0) {
        tr.className = "even";
    }
    tbody.appendChild(tr);
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