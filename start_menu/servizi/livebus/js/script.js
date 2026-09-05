// New fallback system (HA)
const API_ENDPOINT = "https://ertpl-api.vichingo455.com/startbus";
var manualLoad = true;

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    //return cfg.url;
    return "https://startapi.serverissimo.com/busesinservice"
}

// Funzione per applicare il filtro su ogni colonna
function applyFilter() {
    const filterZona = document.getElementById('filterZona').value.toLowerCase();
    const filterLinea = document.getElementById('filterLinea').value.toLowerCase();
    const filterVeicolo = document.getElementById('filterVeicolo').value.toLowerCase();
    const filterCodiceFermata = document.getElementById('filterCodiceFermata').value.toLowerCase();

    const table = document.querySelector('table');
    const rows = table.querySelectorAll('tr');
    let i = 0;

    rows.forEach((row, index) => {
        const cells = row.getElementsByTagName('td');
        let match = true;

        // Verifica ogni cella rispetto al filtro per la colonna
        if (cells[0] && !cells[0].textContent.toLowerCase().includes(filterZona)) match = false;
        if (cells[1] && !cells[1].textContent.toLowerCase().includes(filterLinea)) match = false;
        if (cells[4] && !cells[4].textContent.toLowerCase().includes(filterVeicolo)) match = false;
        if (cells[3] && !cells[3].textContent.toLowerCase().includes(filterCodiceFermata)) match = false;


        // Mostra o nascondi la riga in base al filtro
        if (match == false) {
            row.style.display = 'none';
        } else {
            row.style.display = '';
            i++;
        }
        //Previene casino alla UI quando applichi un filtro
        if (i % 2 == 0) {
            row.className = "even";
        } else {
            row.className = "";
        }
    });
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
}, 20000);

// Fetch dei dati e creazione della tabella
function fetchData() {
    const container = document.getElementById('data-container');
    if (manualLoad) {
        container.innerHTML = '<p style="text-align: center; color: white;">Caricamento in corso, attendere prego...</p>'
    }
    getApiUrl().then(url => {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                /*
                fetch(url + "/versione")
                .then(response => response.json())
                .then(data => {
                    document.getElementById("version").innerHTML = data.version;
                })
                .catch(err => {
                    document.getElementById("version").innerHTML = "Errore";
                });*/

                manualLoad = false;
                container.innerHTML = '';

                //Table and thead creation
                const table = document.createElement('table');

                var th = document.createElement('th');
                const thead = document.createElement('thead');
                const tbody = document.createElement('tbody');
                th.innerHTML = 'Bacino';
                thead.appendChild(th);

                var th = document.createElement('th');
                th.innerHTML = 'Linea';
                thead.appendChild(th);

                var th = document.createElement('th');
                th.innerHTML = 'Direzione';
                thead.appendChild(th);

                var th = document.createElement('th');
                th.innerHTML = 'Veicolo';
                thead.appendChild(th);

                var th = document.createElement('th');
                th.innerHTML = 'Modello veicolo';
                thead.appendChild(th);

                var th = document.createElement('th');
                th.innerHTML = 'Prossima fermata';
                thead.appendChild(th);

                var th = document.createElement('th');
                th.innerHTML = 'Codice percorso';
                th.className = 'mobile-hidden'
                thead.appendChild(th);

                var th = document.createElement('th');
                th.innerHTML = 'Ultimo aggiornamento';
                th.className = 'mobile-hidden'
                thead.appendChild(th);

                table.appendChild(thead);

                // Aggiungi i dati alla tabella
                data.forEach(bus => {
                    const tr = document.createElement('tr');
                    if (bus.vehicle_info.model == null) {
                        bus.vehicle_info.model = "Sconosciuto"
                    }
                    tr.innerHTML = `
                        <td>${bus.basin}</td>
                        <td>${bus.line}</td>
                        <td>${bus.destination}</td>
                        <td>${bus.vehicle_info.number}</td>
                        <td>${bus.vehicle_info.model}</td>
                        <td>${bus.next_stop.stop_name}</td>
                        <td class="mobile-hidden">${bus.shape_id}</td>
                        <td class="mobile-hidden">${bus.last_update}</td>
                    `;
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);
                // Aggiungi la tabella alla pagina
                container.appendChild(table);
                table.id = "tabella";
                // Preserva il filtro
                applyFilter();
                numeromezzi();
            })
            .catch(err => {
                console.error(err)
                container.innerHTML = `<p>Errore nel caricamento dei dati. Potrebbe essere un problema di rete, o un problema con la nostra API. Per favore <a href="#" onclick="manualLoad = true; fetchData();">riprova adesso</a> o riprova più tardi.</p>`;
            });
    }).catch(err => {
        console.error(err)
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
    document.getElementById("filterZona").value = "";
    document.getElementById("filterLinea").value = "";
    document.getElementById("filterVeicolo").value = "";
    document.getElementById("filterCodiceFermata").value = "";
    // Esegui la funzione per applicare i filtri (per sicurezza)
    applyFilter();
    numeromezzi();
}

setInterval(updateClock, 1000);
updateClock();
// Applica il filtro ogni volta che l'utente digita
document.getElementById('filterZona').addEventListener('input', applyFilter);
document.getElementById('filterLinea').addEventListener('input', applyFilter);
document.getElementById('filterVeicolo').addEventListener('input', applyFilter);
document.getElementById('filterCodiceFermata').addEventListener('input', applyFilter);
document.getElementById('filterZona').addEventListener('input', numeromezzi);
document.getElementById('filterLinea').addEventListener('input', numeromezzi);
document.getElementById('filterVeicolo').addEventListener('input', numeromezzi);
document.getElementById('filterCodiceFermata').addEventListener('input', numeromezzi);