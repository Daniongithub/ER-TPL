// New fallback system (HA)
const API_ENDPOINT = "https://ertpl-api.vichingo455.com/start";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url + "/vehicleinfo";
    //return "https://startapi.serverissimo.com/vehicleinfo";
}

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

const tableContainer = document.getElementById('tabella-container');
const numberSpan = document.getElementById('numero-span');

//Sets vehicle number on heading
numberSpan.textContent = id;

getApiUrl().then(url => {
    fetch(url + "/" + id)
        .then(response => {
            if (!response.ok) {
                if (response.status == 404) {
                    tableContainer.innerHTML = `<strong>Il veicolo non è operativo o non comunica dati.</strong>`;
                    return;
                }
                throw new Error("Errore nel caricamento dati");
            }
            return response.json();
        })
        .then(data => {
            const table = document.createElement('table');

            //Create table head
            const thead = document.createElement('thead');
            thead.className = 'nosticky';
            thead.innerHTML = `
                <tr>
                    <th colspan="2" style="text-align:center;">Informazioni veicolo:</th>
                </tr>
            `;

            table.appendChild(thead);

            //Create rows
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="uguale">Linea:</td>
                <td class="uguale">${data.line}</td>
            `;
            table.appendChild(tr);

            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Direzione:</td>
                <td>${data.destination}</td>
            `;
            tr.className = 'even';
            table.appendChild(tr);

            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Bacino linea:</td>
                <td>${data.basin}</td>
            `;
            table.appendChild(tr);

            //Refactors delay (+ if positive)
            if (data.next_stop?.delay > 0) {
                data.next_stop.delay = "+" + data.next_stop.delay;
            }
            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Ritardo/Anticipo: (+/-)</td>
                <td>${data.next_stop?.delay ?? 'Sconosciuto'}</td>
            `;
            tr.className = 'even';
            table.appendChild(tr);

            tr = document.createElement('tr');
            if (data.vehicle_info.bus_page_path != null) {
                tr.innerHTML = `
                    <td>Numero mezzo:</td>
                    <td class="fake-a cursor-pointer" onclick="window.location.href='${data.vehicle_info.bus_page_path}'" target="_blank">${data.vehicle_info.number}</td>
                `;
            } else {
                tr.innerHTML = `
                    <td>Numero mezzo:</td>
                    <td>${data.vehicle_info.number}</td>
                `;
            }
            table.appendChild(tr);

            //Checks if model is null (unknown vehicle)
            if (data.vehicle_info.model == null) {
                data.vehicle_info.model = "Sconosciuto";
            }
            tr = document.createElement('tr');
            if (data.vehicle_info.bus_page_path != null) {
                tr.innerHTML = `
                    <td>Modello:</td>
                    <td class="fake-a cursor-pointer" onclick="window.location.href='${data.vehicle_info.bus_page_path}'" target="_blank">${data.vehicle_info.model}</td>
                `;
            } else {
                tr.innerHTML = `
                    <td>Modello:</td>
                    <td>${data.vehicle_info.model}</td>
                `;
            }
            tr.className = 'even';
            table.appendChild(tr);

            //Checks if plate is null (unknown vehicle)
            if (data.vehicle_info.plate_num == null) {
                data.vehicle_info.plate_num = "Sconosciuto";
            }
            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Targa:</td>
                <td>${data.vehicle_info.plate_num}</td>
            `;
            table.appendChild(tr);

            //Checks if basin is null (unknown vehicle)
            if (data.vehicle_info.basin == null) {
                data.vehicle_info.basin = "Sconosciuto";
            }
            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Bacino veicolo:</td>
                <td>${data.vehicle_info.basin}</td>
            `;
            tr.className = 'even';
            table.appendChild(tr);

            //Checks if next_stop is null
            if (data.next_stop == null) {
                data.next_stop = {
                    "stop_name": "Sconosciuto",
                    "stop_code": "Sconosciuto",
                    "arrival_time": "Sconosciuto",
                    "delay": "Sconosciuto",
                }
            }
            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Prossima fermata:</td>
                <td class="fake-a cursor-pointer" onclick="window.location.href='/start_menu/servizi/fermate/fermata.html?code=${data.next_stop.stop_code}&basin=${data.basin}'" target="_blank">${data.next_stop.stop_name}</td>
            `;
            table.appendChild(tr);

            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Codice fermata:</td>
                <td class="fake-a cursor-pointer" onclick="window.location.href='/start_menu/servizi/fermate/fermata.html?code=${data.next_stop.stop_code}&basin=${data.basin}'" target="_blank">${data.next_stop.stop_code}</td>
            `;
            tr.className = 'even';
            table.appendChild(tr);

            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Codice linea:</td>
                <td>${data.route_id}</td>
            `;
            table.appendChild(tr);

            //Per ora lo metto così, ma va fatto il servizio percorsi e questo punterà alla lista fermate!
            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Codice percorso:</td>
                <td class="fake-a cursor-pointer" onclick="window.location.href='/start_menu/servizi/mappa/index.html?mode=shapes&basin=${data.basin}&shapeId=${data.shape_id}'" target="_blank">${data.shape_id}</td>
            `;
            tr.className = 'even';
            table.appendChild(tr);

            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Codice corsa:</td>
                <td>${data.trip_id}</td>
            `;
            table.appendChild(tr);

            //Spawns position only if available
            let nextClass = "even"
            if (data.vehicle_lat != null) {
                tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>Posizione:</td>
                    <td class="fake-a cursor-pointer" onclick="window.open('/start_menu/servizi/mappa/index.html?mode=single&basin=${data.basin}&vehicle=${data.vehicle_info.number}', '_blank');">GPS</td>
                `;
                tr.className = 'even';
                nextClass = ""
                table.appendChild(tr);
            }

            //Last update
            let ISOdate = new Date(data.last_update);
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
            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Ultimo aggiornamento:</td>
                <td>${aggiornamento}</td>
            `;
            tr.className = nextClass;
            table.appendChild(tr);

            tableContainer.innerHTML = '';
            tableContainer.appendChild(table);
        })
})