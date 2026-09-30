const API_ENDPOINT = "https://ertpl-api.vichingo455.com/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const linea = params.get('routenum');

const lineaSpan = document.getElementById('linea-span');
const asDiContainer = document.getElementById('as-di-container');
const asButton = document.getElementById('as-button');
const diButton = document.getElementById('di-button');
const filterContainer = document.getElementById('filter-container');
const filterSelect = document.getElementById('filter-select');
const tableContainer = document.getElementById('table-container');
const infoContainer = document.getElementById('info-container');

//Fills line span
lineaSpan.textContent = linea;
//Checks if there is a routenum parameter and it's not empty
if (!linea) {
    asDiContainer.style.display = "none";
    tableContainer.textContent = `Non hai specificato nessuna linea.`;
}

function fetchData(verse) {
    getApiUrl().then(url => {
        fetch(url + "/timetable?line=" + linea + "&verse=" + verse)
            .then(response => {
                if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
                return response.json();
            })
            .then(data => {
                tableContainer.innerHTML = '';
                const table = document.createElement('table');

                renderTH(table, data.journeys);
                renderTable(table, data.journeys, data.stops);
                fillSelect(data.journeys);

                tableContainer.appendChild(table);
                renderCount(data.journeys);
            })
            .catch(error => {
                console.error('Errore nel caricamento dei dati:', error)
                tableContainer.innerHTML = "Non sono previste corse oggi o la linea non esiste"
            });
    })
}

function renderTH(table, journeys) {
    const thead = document.createElement("thead");
    const tr = document.createElement('tr');
    //First column is empty, it's the stops column
    tr.innerHTML = `<th>Linea e percorso</th>`;
    journeys.forEach(element => {
        //Route code th row
        const th = document.createElement('th');
        //Display info th row
        if (element.display_line != null) {
            th.innerHTML = `${element.display_line}<br>`;
            if (element.display_destination != null) {
                th.innerHTML += `${element.display_destination}<br>(${element.route_code.split("-")[2]})`;
            } else {
                th.innerHTML += `(${element.route_code.split("-")[2]})`;
            }
        } else {
            th.innerHTML = `${linea} <br> (${element.route_code.split("-")[2]})`;
        }
        th.className = 'cursor-pointer';
        th.setAttribute("onclick", `window.location.href="/seta_modena/servizi/percorsi/percorso.html?routecode=${element.route_code}&routenum=${linea}"`);
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
}

var frequencies = [];
function renderTable(table, journeys, stops) {
    const tbody = document.createElement('tbody');
    //Rows loop
    stops.forEach((stop, idx) => {
        const tr = document.createElement('tr');
        //Row elements loop
        journeys.forEach((arrival, jdx) => {
            //First column is stop name column
            if (jdx == 0) {
                tr.innerHTML += `
                    <td>${stop}</td>
                    <td>${arrival.times[idx]}</td>
                `;
            } else {
                tr.innerHTML += `
                    <td>${arrival.times[idx]}</td>
                `;
            }
        })
        if (idx % 2 != 0) {
            tr.className = "even";
        }
        tbody.appendChild(tr);
    })
    //TODO Journey info

    table.appendChild(tbody);
}

function renderCount(journeys) {
    const p = document.createElement('p');
    p.innerHTML = `Totale corse: ${journeys.length}`;
    infoContainer.appendChild(p);
}

function fillSelect(journeys) {
    var allRoutes = [];
    journeys.forEach((journey, idx) => {
        if (journey.display_line != null && journey.display_destination != null) {
            allRoutes[idx] = journey.display_line + " - " + journey.display_destination;
            filterContainer.style.display = '';
        }
    })
    var uniqueRoutes = allRoutes.filter(onlyUnique);
    uniqueRoutes.forEach(element => {
        const option = document.createElement('option');
        option.value = element;
        option.innerHTML = element;
        filterSelect.appendChild(option);
    })
}

function setAs() {
    tableContainer.innerHTML = 'Caricamento in corso...';
    infoContainer.innerHTML = '';
    filterSelect.innerHTML = '<option value="" disabled selected hidden>Filtra per destinazione:</option>';
    asButton.className = "selected";
    diButton.className = "";
    var verse = "As";
    fetchData(verse);
}

function setDi() {
    tableContainer.innerHTML = 'Caricamento in corso...';
    infoContainer.innerHTML = '';
    filterSelect.innerHTML = '<option value="" disabled selected hidden>Filtra per destinazione:</option>';
    diButton.className = "selected";
    asButton.className = "";
    var verse = "Di";
    fetchData(verse);
}

//At page startup we choose going trip to be displayed
setAs();

filterSelect.addEventListener('change', function (event) {
    const table = document.querySelector('#table-container table');
    const rows = table.querySelectorAll('tr');
    var option = event.target.value;

    //Check what matches the filter in the first row
    const ths = document.querySelectorAll('#table-container table thead th')
    var invalidCols = []
    var i = 0
    ths.forEach((th, idx) => {
        if (th.innerHTML.split("<br>")[0] + " - " + th.innerHTML.split("<br>")[1] != option && idx != 0) {
            invalidCols[i] = idx
            i++;
        }
    })

    var i = 0;
    rows.forEach((row, idx) => {
        row.style.display = '';
        const cells = row.querySelectorAll('td, th');

        var empty = true;
        cells.forEach((cell, jdx) => {
            cell.style.display = "";
            if (invalidCols.includes(jdx)) {
                cell.style.display = "none";
            }
            if (idx == 0 || (cell.style.display != "none" && cell.innerHTML != "" && cell.innerHTML != "|" && jdx != 0)) {
                empty = false;
            }
        })
        //Removes empty lines
        if (empty) {
            row.style.display = "none";
        } else {
            i++;
        }
        if (i % 2 != 0) {
            row.className = "even";
        } else {
            row.className = "";
        }
    });
})

//utils
function toMinutes(time_str) {
    var parts = time_str.split(':');
    return parts[0] * 60 + // an hour has 60 mintues
        parts[1];          // mintues
}

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}