// API source code: https://github.com/Daniongithub/startfermate-api

const API_ENDPOINT = "https://ertpl-api.vichingo455.com/startfermate";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    //return cfg.url;
    return "https://startapi.serverissimo.com"
}

const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const basin = params.get('basin');
let nome

const tableContainer = document.getElementById('tabella-container');
const stopSpan = document.getElementById('fermata-span');
const corsieNav = document.getElementById('corsie-nav');

//Fermata opposta button
getApiUrl().then(url => {
    fetch(url + "/static/stops/" + basin)
        .then(response => {
            if (!response.ok) throw new Error("Errore nel caricamento lista fermate.");
            return response.json();
        })
        .then(data => {
            allresults = data;
            const stopsMap = new Map();
            allresults.forEach(bstop => {
                stopsMap.set(bstop.stop_code, bstop.stop_name);
            })
            nome = stopsMap.get(code);
            if (nome == undefined) {
                nome = code;
            }
            //Sets stop name
            const stopSpan = document.getElementById('fermata-span');
            stopSpan.textContent = nome + " (" + code + ")";

            //Pulsante dall'altra parte
            if (altraParteSearch(nome)) {
                const codes = altraParteSearch(nome);
                let altroCodice
                if (code == codes[0]) {
                    altroCodice = codes[1];
                } else {
                    altroCodice = codes[0];
                }
                corsieNav.innerHTML = `
                <ul>
                    <li>
                        <a href="/start_menu/servizi/fermate/fermata.html?code=${altroCodice}&basin=${basin}">Fermata opposta</a>
                    </li>
                </ul>`;
            }
        })
        .catch(error => console.error('Errore nel caricamento dei dati:', error));
})

function loadArrivals() {
    getApiUrl().then(url => {
        fetch(url + "/arrivals/" + code)
            .then(response => {
                if (!response.ok) { tableContainer.textContent = "Errore nel caricamento lista fermate"; throw new Error("Errore nel caricamento lista fermate.") }
                return response.json()
            })
            .then(data => {
                tableContainer.innerHTML = '';
                const table = document.createElement('table');

                //Spawn table head
                const thead = document.createElement('thead');

                thead.innerHTML = `
                    <tr>
                        <th class="linea">Linea</th>
                        <th class="direzione">Direzione</th>
                        <th class="orario">Orario (Rit/Ant)</th>
                        <th class="veicolo">Veicolo</th>
                        <th class="location">Prossima fermata</th>
                    </tr>
                `;

                table.appendChild(thead);
                data.forEach((element, idx) => {
                    const tr = document.createElement('tr');
                    let formattedDelay = "";
                    let nextStopName = "";
                    //Checks if route is realtime and displays real time information
                    if (element.state == "realtime") {
                        if (element.next_stop.delay > 0) {
                            formattedDelay = `(+${element.next_stop.delay})`
                        } else {
                            formattedDelay = `(${element.next_stop.delay})`
                        }
                        if (element.next_stop.stop_name == nome) {
                            nextStopName = "<strong>" + element.next_stop.stop_name + "</strong>"
                        } else {
                            nextStopName = element.next_stop.stop_name
                        }
                    }
                    //Canceled trips
                    if (element.state == "canceled") {
                        formattedDelay = "SOPPRESSA"
                        tr.className = "red-bg"
                        element.arrival_time = `<s>${element.arrival_time}</s>`
                    }
                    //Checks if vehicle is null
                    let vehicle = "";
                    if (element.vehicle != null) {
                        vehicle = `${element.vehicle}`
                    }
                    tr.innerHTML = `
                        <td>${element.line}</td>
                        <td>${element.destination}</td>
                        <td>${element.arrival_time} ${formattedDelay}</td>
                        <td>${vehicle}</td>
                        <td>${nextStopName}</td>
                    `;
                    if (idx % 2 != 0) {
                        tr.className = "even"
                    }
                    table.appendChild(tr);
                });
                tableContainer.appendChild(table);
            })
    })
}

function altraParteSearch(searchTerm) {
    let dupedCodes = [];
    let i = 0;
    allresults.forEach(element => {
        if (element.stop_name.toLowerCase() == searchTerm.toLowerCase()) {
            dupedCodes[i] = element.stop_code;
            i++;
        }
    });
    if (dupedCodes.length == 2) {
        return dupedCodes;
    } else if (dupedCodes.length == 1) {
        return undefined;
    }
}

loadArrivals()

timer = setInterval(() => {
    loadArrivals();
}, 30000);