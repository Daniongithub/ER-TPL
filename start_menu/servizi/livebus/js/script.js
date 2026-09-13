// New fallback system (HA)
const API_ENDPOINT = "https://ertpl-api.vichingo455.com/start";
let manualLoad = true;

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url + "/busesinservice";
    //return "https://startapi.serverissimo.com/busesinservice";
}

// Funzione per riempire il select dei modelli
// I modelli disponibili dipendono SOLO da Bacino e Linea
function fillModels() {
    const modelSelect = document.getElementById('filter-modello');
    const table = document.getElementById('tabella');

    if (!table || !modelSelect) return;

    const currentModel = modelSelect.value;
    const filterZona = document.getElementById('filter-zona').value.toLowerCase();
    const filterLinea = document.getElementById('filter-linea').value.toLowerCase();

    const models = new Set();

    table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.getElementsByTagName('td');

        if (cells.length <= 4) return;

        // Considera SOLO Bacino e Linea
        const zona = cells[0].textContent.trim().toLowerCase();
        const linea = cells[1].textContent.trim().toLowerCase();

        if (!zona.includes(filterZona)) return;
        if (!linea.includes(filterLinea)) return;

        // Il modello viene raccolto indipendentemente dal filtro modello
        const model = cells[4].textContent.trim();

        if (model && model !== "Sconosciuto") {
            models.add(model);
        }
    });

    // Ricrea le option
    modelSelect.options.length = 1;

    [...models]
        .sort((a, b) => a.localeCompare(b, 'it', {
            sensitivity: 'base'
        }))
        .forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });

    // Mantieni il modello selezionato se è ancora compatibile
    if (models.has(currentModel)) {
        modelSelect.value = currentModel;
    } else {
        modelSelect.value = "";
    }
}


// Funzione per applicare i filtri
function applyFilter() {
    const filterZona = document.getElementById('filter-zona').value.toLowerCase();
    const filterLinea = document.getElementById('filter-linea').value.toLowerCase();
    const filterModello = document.getElementById('filter-modello').value.toLowerCase();

    const table = document.getElementById('tabella');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    let i = 0;

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        let match = true;

        // BACINO
        if (cells[0] &&
            !cells[0].textContent.toLowerCase().includes(filterZona)) {
            match = false;
        }

        // LINEA
        if (cells[1] &&
            !cells[1].textContent.toLowerCase().includes(filterLinea)) {
            match = false;
        }

        // MODELLO
        if (cells[4] &&
            !cells[4].textContent.toLowerCase().includes(filterModello)) {
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
            noResults.style.cssText = `
                text-align: center;
                color: white;
                padding: 20px;
                margin: 0;
            `;
            container.appendChild(noResults);
        }

        noResults.textContent = 'Nessun mezzo corrisponde ai filtri selezionati.';
        noResults.style.display = '';
    } else {
        // Ci sono risultati: mostra la tabella
        table.style.display = '';

        // Nasconde il messaggio
        if (noResults) {
            noResults.style.display = 'none';
        }
    }

    numeromezzi();
}


function numeromezzi() {
    const table = document.getElementById('tabella');
    //let nummezzi = table.tBodies[0].rows.length;
    const rows = table.querySelectorAll('tbody tr');
    const visibili = Array.from(rows).filter(row => {
        return window.getComputedStyle(row).display !== 'none';
    });
    document.getElementById('nummezzi').innerHTML = visibili.length;
}
// Primo fetch
fetchData();

timer = setInterval(() => {
    fetchData();
}, 30000);

// Fetch dei dati e creazione della tabella
function fetchData() {
    const container = document.getElementById('data-container');
    if (manualLoad) {
        container.innerHTML = '<p style="text-align: center; color: white;">Caricamento in corso, attendere prego...</p>';
    }
    getApiUrl().then(url => {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                manualLoad = false;
                container.innerHTML = '';

                //Table and thead creation
                const table = document.createElement('table');

                let th1 = document.createElement('th');
                const thead = document.createElement('thead');
                const tbody = document.createElement('tbody');
                th1.innerHTML = 'Bacino';
                thead.appendChild(th1);

                let th2 = document.createElement('th');
                th2.innerHTML = 'Linea';
                thead.appendChild(th2);

                let th3 = document.createElement('th');
                th3.innerHTML = 'Direzione';
                thead.appendChild(th3);

                let th4 = document.createElement('th');
                th4.innerHTML = 'Veicolo';
                thead.appendChild(th4);

                let th5 = document.createElement('th');
                th5.innerHTML = 'Modello';
                thead.appendChild(th5);

                let th6 = document.createElement('th');
                th6.innerHTML = 'Prossima fermata';
                thead.appendChild(th6);

                let th7 = document.createElement('th');
                th7.innerHTML = 'Codice fermata';
                th7.className = 'mobile-hidden';
                thead.appendChild(th7);

                let th8 = document.createElement('th');
                th8.innerHTML = 'Ultimo aggiornamento';
                th8.className = 'mobile-hidden';
                thead.appendChild(th8);

                table.appendChild(thead);

                // Aggiungi i dati alla tabella
                data.forEach(bus => {
                    const tr = document.createElement('tr');
                    if (bus.vehicle_info.model == null) {
                        bus.vehicle_info.model = "Sconosciuto";
                    }
                    if (bus.next_stop == null) {
                        bus.next_stop = {
                            stop_name: "",
                            stop_code: ""
                        };
                    }

                    let ISOdate = new Date(bus.last_update);
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

                    tr.innerHTML = `
                        <td>${bus.basin}</td>
                        <td>${bus.line}</td>
                        <td>${bus.destination}</td>
                        <td class="cursor-pointer" onclick="window.location.href='infoveicolo.html?id=${bus.vehicle_info.number}'">${bus.vehicle_info.number}</td>
                        <td>${bus.vehicle_info.model}</td>
                        <td>${bus.next_stop.stop_name}</td>
                        <td class="mobile-hidden">${bus.next_stop.stop_code}</td>
                        <td class="mobile-hidden">${aggiornamento}</td>
                    `;
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);
                // Aggiungi la tabella alla pagina
                container.appendChild(table);
                table.id = "tabella";
                // Preserva il filtro
                applyFilter();
                fillModels();
                numeromezzi();
            })
            .catch(err => {
                console.error(err);
                container.innerHTML = `<p>Errore nel caricamento dei dati. Potrebbe essere un problema di rete, o un problema con la nostra API. Per favore <a href="#" onclick="manualLoad = true; fetchData();">riprova adesso</a> o riprova più tardi.</p>`;
            });
    }).catch(err => {
        console.error(err);
        container.innerHTML = `<p>Errore nel caricamento dei dati. Potrebbe essere un problema di rete, o un problema con la nostra API. Per favore <a href="#" onclick="manualLoad = true; fetchData();">riprova adesso</a> o riprova più tardi.</p>`;
    });
}
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}
function clearFilters() {
    // Pulisci tutti i filtri
    document.getElementById("filter-zona").value = "";
    document.getElementById("filter-linea").value = "";
    document.getElementById("filter-modello").value = "";
    // Esegui la funzione per applicare i filtri (per sicurezza)
    applyFilter();
    numeromezzi();
}

setInterval(updateClock, 1000);
updateClock();
// Applica il filtro ogni volta che l'utente digita
document.getElementById('filter-zona').addEventListener('change', applyFilter);
document.getElementById('filter-linea').addEventListener('input', applyFilter);
document.getElementById('filter-modello').addEventListener('change', applyFilter);
document.getElementById('filter-zona').addEventListener('change', numeromezzi);
document.getElementById('filter-linea').addEventListener('input', numeromezzi);
document.getElementById('filter-modello').addEventListener('change', numeromezzi);