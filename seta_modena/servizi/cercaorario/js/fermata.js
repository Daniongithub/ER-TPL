const API_ENDPOINT = "https://ertpl-api.vichingo455.com/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const codice = params.get('code');

getApiUrl().then(url => {
    fetch(url + "/stops")
        .then(response => {
            if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
            return response.json();
        })
        .then(data => {
            allresults = data;
            const stopsMap = new Map();
            allresults.forEach(bstop => {
                stopsMap.set(bstop.code, bstop.name);
            })
            var nome = stopsMap.get(codice);
            if (nome == undefined) {
                nome = codice;
            }
            //Sets stop name
            const fermata_span = document.getElementById('fermata-span');
            fermata_span.textContent = nome;

            //Pulsante dall'altra parte
            const corsie_nav = document.getElementById('corsie-nav');
            if (altraParteSearch(nome)) {
                const codes = altraParteSearch(nome);
                const altrocodice = 0;
                if (codice == codes[0]) {
                    altroCodice = codes[1];
                } else {
                    altroCodice = codes[0];
                }
                corsie_nav.innerHTML = `
                <ul>
                    <li>
                        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=${altroCodice}">Fermata opposta</a>
                    </li>
                </ul>`;
            }
            //Set corsie per stazione o autostazione
            if (nome.includes("STAZIONE FS")) {
                corsie_nav.innerHTML = `
                <ul>
                    <li>
                        <a href="/seta_modena/servizi/cercaorario/altrecorsie.html?location=STAZIONE FS">Altre corsie</a>
                    </li>
                </ul>`;
            }
            if (nome.includes("MODENA AUTOSTAZIONE")) {
                corsie_nav.innerHTML = `
                <ul>
                    <li>
                        <a href="/seta_modena/servizi/cercaorario/altrecorsie.html?location=MODENA AUTOSTAZIONE">Altre corsie</a>
                    </li>
                </ul>`;
            }
            if (nome.includes("GARIBALDI")) {
                corsie_nav.innerHTML = `
                <ul>
                    <li>
                        <a href="/seta_modena/servizi/cercaorario/altrecorsie.html?location=GARIBALDI">Altre corsie</a>
                    </li>
                </ul>`;
            }
            if (nome.includes("POLO LEONARDO")) {
                corsie_nav.innerHTML = `
                <ul>
                    <li>
                        <a href="/seta_modena/servizi/cercaorario/altrecorsie.html?location=POLO LEONARDO">Altre corsie</a>
                    </li>
                </ul>`;
            }
        })
        .catch(error => console.error('Errore nel caricamento dei dati:', error));
})

const container = document.getElementById('tabella-container');

function caricadati() {
    getApiUrl().then(url => {
        fetch(url + "/arrivals/" + codice)
            .then(response => {
                if (!response.ok && response.status !== 400) throw new Error("Errore nel caricamento dei dati.");
                else {
                    container.innerHTML = '';

                    if (response.status === 400) {
                        container.innerHTML = '<h3 style="margin:12px;">Nessuna corsa programmata nei prossimi 90 minuti.</h3>';
                        container.style.marginTop = '12px'
                        throw new Error("NO_ARRIVALS");
                    }
                }

                return response.json();
            })
            .then(data => {
                item = data.arrivals;
            })
            .then(data => {
                // Creo tabella
                const table = document.createElement('table');

                // Intestazione
                const thead = document.createElement('thead');
                thead.innerHTML = `
                    <tr>
                        <th class="linea">Linea</th>
                        <th class="direzione">Direzione</th>
                        <th class="orario">Orario (Rit/Ant)</th>
                        <th class="stato">Stato corsa</th>
                        <th class="veicolo">Veicolo</th>
                        <th class="location">Ora si trova a</th>
                    </tr>
                `;
                table.appendChild(thead);

                // Corpo tabella
                const tbody = document.createElement('tbody');
                item.services.forEach(item => {
                    const tr = document.createElement('tr');
                    if (item.state == "planned") {
                        var stato = "Prevista";
                    } else {
                        var stato = "Tempo reale";
                    } if (item.next_stop == null) {
                        var posizione = "";
                    } else {
                        var posizione = item.next_stop;
                    }
                    if (item.has_problems == true) {
                        tr.innerHTML = `
                    <td class="bus-card-red cursor-pointer" onclick="window.location.href='/seta_modena/servizi/cercaorario/notizielinea.html?routenum=${item.official_line}'">${item.line}</td>
                    <td class="bus-card-red cursor-pointer" onclick="window.location.href='/seta_modena/servizi/cercaorario/notizielinea.html?routenum=${item.official_line}'">${item.destination}</td>
                `;
                    } else {
                        tr.innerHTML = `
                    <td>${item.line}</td>
                    <td>${item.destination}</td>
                `;
                    }

                    //Delay
                    if (item.delay > 0) {
                        tr.innerHTML += `
                    <td>${item.arrival_time} (+${item.delay})</td>
                    <td>${stato}</td>
                `;
                    } else if (item.delay <= 0 && item.delay != null) {
                        tr.innerHTML += `
                    <td>${item.arrival_time} (${item.delay})</td>
                    <td>${stato}</td>
                `;
                    } else {
                        tr.innerHTML += `
                    <td>${item.arrival_time}</td>
                    <td>${stato}</td>
                `;
                    }

                    //AEP specification
                    if (item.has_AEP == true) {
                        tr.innerHTML += `
                    <td class="bus-card-green cursor-pointer" onclick="window.location.href='https://wimb.setaweb.it/qm/index.html?id=${item.vehicle}'">${item.vehicle}</a></td>
                    <td>${posizione}</td>
                `;
                    } else if (item.delay != null) {
                        tr.innerHTML += `
                    <td class="cursor-pointer" onclick="window.location.href='https://wimb.setaweb.it/qm/index.html?id=${item.vehicle}'">${item.vehicle}</a></td>
                    <td>${posizione}</td>
                `;
                    } else {
                        tr.innerHTML += `
                    <td></td>
                    <td></td>
                `;
                    }
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);

                container.appendChild(table);
            })
            .catch(err => {
                if (err.message === "NO_ARRIVALS") {
                    //Caso gestito volontariamente: non fare nulla
                    return;
                }
                console.error('Errore nel caricamento dati:', err);
                document.getElementById('tabella-container').textContent = 'Errore nel caricamento dati.';
            });
    })
}

caricadati();

setInterval(caricadati, 30000);

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