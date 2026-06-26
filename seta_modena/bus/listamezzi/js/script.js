const tableContainer = document.getElementById('table-container');

const API_ENDPOINT = "https://ertpl-api.vercel.app/mezzi";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

//URL (new remote DB)
//const url = "/seta_modena/menu/js/setabus.json";
//const url = "https://dbiface.serverissimo.com/api/seta/mezzi";

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
fetch(url + "/seta/mezzi")
.then(response => {
    if (!response.ok) {
        throw new Error("Errore nel caricamento dei dati.");
        tableContainer.innerHTML="<strong>Errore nella lettura dell'elenco mezzi.</strong>";
    }
    return response.json();
})
.then(data => {
    //Remove loading
    tableContainer.innerHTML='';

    //Fill the table
    data.forEach(bus => {
        const tr = document.createElement('tr');

        tr.className = bus.stato;

        tr.innerHTML = `
            <td class="cursor-pointer" onclick="window.location.href='${bus.link}'">${bus.matricola}</td>
            <td>${bus.modello}</td>
            <td>${bus.settore}</td>
        `;

        table.appendChild(tr)
    });
    tableContainer.appendChild(table);
})
});