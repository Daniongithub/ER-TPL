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
            data.forEach(bus => {
                const tr = document.createElement('tr');

                tr.className = bus.status;
                tr.innerHTML = `
                    <td class="cursor-pointer" onclick="window.location.href='${bus.page_link}'">${bus.number}</td>
                    <td>${bus.model}</td>
                    <td>${bus.sector}</td>
                `;

                table.appendChild(tr)
            });
            tableContainer.appendChild(table);
        })
});