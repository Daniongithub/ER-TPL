const API_ENDPOINT = "https://ertpl-api.vichingo455.com/start";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const basin = params.get('basin');
const linea = params.get('routecode');

const lineaSpan = document.getElementById('linea-span');
const asDiContainer = document.getElementById('as-di-container');
const asButton = document.getElementById('as-button');
const diButton = document.getElementById('di-button');
const filterContainer = document.getElementById('filter-container');
const filterSelect = document.getElementById('filter-select');
const tableContainer = document.getElementById('table-container');
const infoContainer = document.getElementById('info-container');

//Fills line span
function getDispLine() {
    getApiUrl().then(url => {
        fetch(url + "/static/routes/" + basin)
            .then(response => {
                if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
                return response.json();
            })
            .then(data => {
                const categorie = ["urban", "suburban", "exurban", "school", "shuttle"];
                let found = null;

                for (const cat of categorie) {
                    if (data[cat]) {
                        const match = data[cat].find(route => route.route_id == linea && route.disp_line);
                        if (match) {
                            found = match.disp_line;
                            break;
                        }
                    }
                }

                lineaSpan.textContent = found !== null ? found : linea;
            })
            .catch(error => {
                console.error('Errore nel caricamento dei dati:', error)
                tableContainer.innerHTML = "Impossibile caricare la lista linee."
            });
    })
}
getDispLine();

//Checks if there is a routenum parameter and it's not empty
if (!linea) {
    asDiContainer.style.display = "none";
    tableContainer.textContent = `Non hai specificato nessuna linea.`;
}

function fetchData(verse) {
    getApiUrl().then(url => {
        fetch(url + "/timetable/" + basin + "/" + linea + "/" + verse)
            .then(response => {
                if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
                return response.json();
            })
            .then(data => {
                tableContainer.innerHTML = '';
                const table = document.createElement('table');

                renderTH(table, data);
                renderTable(table, data);
                fillSelect(data);

                tableContainer.appendChild(table);
                renderCount(data);
            })
            .catch(error => {
                console.error('Errore nel caricamento dei dati:', error)
                tableContainer.innerHTML = "Non sono previste corse oggi o la linea non esiste"
            });
    })
}

function renderTH(table, trips) {
    const thead = document.createElement("thead");
    const tr = document.createElement('tr');
    //First column is empty, it's the stops column
    tr.innerHTML = `<th>Linea e percorso</th>`;
    trips.forEach(element => {
        //Route code th row
        const th = document.createElement('th');
        //Display info th row
        if (element.trip_info.line != null) {
            th.innerHTML = `${element.trip_info.line}<br>`;
            if (element.trip_info.destination != null) {
                th.innerHTML += `${element.trip_info.destination}<br>(${element.trip_info.shape_id})`;
            } else {
                th.innerHTML += `(${element.trip_info.shape_id})`;
            }
        } else {
            th.innerHTML = `${linea}<br>(${element.trip_info.shape_id})`;
        }
        //th.className = 'cursor-pointer';
        //th.setAttribute("onclick", `window.location.href="/romagna/servizi/percorsi/percorso.html?shapeid=${element.route_code}&routecode=${linea}"`);
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
}

function renderTable(table, trips) {
    const tbody = document.createElement('tbody');

    const stopOrder = buildStopOrder(trips);

    const tripStopMaps = trips.map(trip => {
        const m = new Map();
        trip.stop_times.forEach(arrival => m.set(arrival.stop_name, arrival.arrival_time));
        return m;
    });

    // Per ogni corsa, trova indice (nello stopOrder) della prima e ultima fermata servita
    const tripRanges = tripStopMaps.map(tripMap => {
        let first = -1, last = -1;
        stopOrder.forEach((stopName, i) => {
            if (tripMap.has(stopName)) {
                if (first === -1) first = i;
                last = i;
            }
        });
        return { first, last };
    });

    stopOrder.forEach((stopName, rowIdx) => {
        const tr = document.createElement('tr');
        let rowHtml = `<td>${stopName}</td>`;

        tripStopMaps.forEach((tripMap, tripIdx) => {
            const time = tripMap.get(stopName);
            let cellContent = '';

            if (time) {
                cellContent = time;
            } else {
                const { first, last } = tripRanges[tripIdx];
                if (rowIdx > first && rowIdx < last) {
                    cellContent = '|';
                }
            }

            rowHtml += `<td>${cellContent}</td>`;
        });

        tr.innerHTML = rowHtml;
        if (rowIdx % 2 != 0) tr.className = "even";
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
}

function renderCount(journeys) {
    const p = document.createElement('p');
    p.innerHTML = `Totale corse: ${journeys.length}`;
    infoContainer.appendChild(p);
}

function fillSelect(trips) {
    var allRoutes = [];
    trips.forEach((trip, idx) => {
        if (trip.trip_info.line != null && trip.trip_info.destination != null) {
            allRoutes[idx] = trip.trip_info.line + " - " + trip.trip_info.destination;
            filterContainer.style.display = '';
        } else {
            allRoutes[idx] = linea + " - " + trip.trip_info.shape_id;
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
    var verse = "0";
    fetchData(verse);
}

function setDi() {
    tableContainer.innerHTML = 'Caricamento in corso...';
    infoContainer.innerHTML = '';
    filterSelect.innerHTML = '<option value="" disabled selected hidden>Filtra per destinazione:</option>';
    diButton.className = "selected";
    asButton.className = "";
    var verse = "1";
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
        var cleanedContent = th.innerHTML;
        if (cleanedContent.split("<br>")[0] + " - " + cleanedContent.split("<br>")[1] != option && idx != 0) {
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
function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

function buildStopOrder(trips) {
    const stopNames = new Set();
    const successors = new Map(); // stopName -> stop set with stops that come right after
    const inDegree = new Map();   // stopName -> how much stops are before this one

    trips.forEach(trip => {
        const sorted = [...trip.stop_times].sort((a, b) => a.stop_sequence - b.stop_sequence);
        sorted.forEach((arrival, i) => {
            const name = arrival.stop_name;
            stopNames.add(name);
            if (!successors.has(name)) successors.set(name, new Set());
            if (!inDegree.has(name)) inDegree.set(name, 0);

            if (i > 0) {
                const prevName = sorted[i - 1].stop_name;
                if (prevName !== name && !successors.get(prevName).has(name)) {
                    successors.get(prevName).add(name);
                    inDegree.set(name, (inDegree.get(name) || 0) + 1);
                }
            }
        });
    });

    // Kahn's algorithm
    const queue = [...stopNames].filter(name => (inDegree.get(name) || 0) === 0);
    const order = [];

    while (queue.length > 0) {
        const node = queue.shift();
        order.push(node);
        successors.get(node).forEach(next => {
            inDegree.set(next, inDegree.get(next) - 1);
            if (inDegree.get(next) === 0) queue.push(next);
        });
    }

    if (order.length !== stopNames.size) {
        stopNames.forEach(name => { if (!order.includes(name)) order.push(name); });
    }

    return order; // array di stop_name nell'ordine corretto
}