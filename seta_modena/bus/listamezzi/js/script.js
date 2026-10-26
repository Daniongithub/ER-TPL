const API_ENDPOINT = "https://ertpl-api.vichingo455.com/mezzi";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const tableContainer = document.getElementById('table-container');

//Create table
const table = document.createElement('table');

//Spawn table head
const thead = document.createElement('thead');
thead.innerHTML = `
    <th>Matricola</th>
    <th>Mezzo</th>
    <th>Tipo</th>
    <!--<th>Targa</th>-->
    <th>Ultimo servizio</th>
`;
table.appendChild(thead);

getApiUrl().then(url => {
    fetch(url + "/list/SETA")
        .then(response => {
            if (!response.ok) {
                tableContainer.innerHTML = "<strong>Errore nella lettura dell'elenco mezzi.</strong>";
                throw new Error("Errore nel caricamento dei dati.");
            }
            return response.json();
        })
        .then(data => {
            //Remove loading
            tableContainer.innerHTML = '';

            //Fill the table
            data.forEach((bus, idx) => {
                const tr = document.createElement('tr');

                if (!bus.last_seen_date) {
                    bus.last_seen_date = "-";
                }
                if (!bus.plate_num) {
                    bus.plate_num = "-";
                }
                tr.className = bus.status;
                tr.innerHTML = `
                    <td class="cursor-pointer" onclick="window.location.href='${bus.page_link}'">${bus.number}</td>
                    <td>${bus.model}</td>
                    <td>${bus.sector}</td>
                    <!--<td>${bus.plate_num}</td>-->
                    <td>${bus.last_seen_date}</td>
                `;
                if (idx % 2 != 0) {
                    tr.classList.add("even");
                }

                table.appendChild(tr)
            });
            tableContainer.appendChild(table);
        })
});