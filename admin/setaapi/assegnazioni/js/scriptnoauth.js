function getValidToken() {
    const token = sessionStorage.getItem("access_token");
    const expiry = sessionStorage.getItem("token_expiry");

    if (!token || !expiry || Date.now() > Number(expiry)) {
        return null; // assente o scaduto
    }
    return token;
}

//redirectToLogin()

//Actual page script
const API_ENDPOINT = "https://ertpl-api.vichingo455.com/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const tableContainer = document.getElementById('table-container');

getApiUrl().then(url => fetch(url + "/assignments")
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        renderTable(data);
    })
    .catch(err => {
        console.error('Errore nel caricamento dati:', err);
        tableContainer.textContent = 'Errore nel caricamento dati.';
    }));

function renderTable(item,selectedOption){
    try{
        if(selectedOption==undefined){
            tableContainer.innerHTML = '';

            // Creo tabella
            const table = document.createElement('table');
            table.className = "table table-striped w-100";

            // Intestazione
            renderTH(table);

            // Corpo tabella
            const tbody = document.createElement('tbody');
            item.forEach((item, idx) => {
                renderElement(tbody, item, idx);
            });
            table.appendChild(tbody);

            tableContainer.appendChild(table);
        }
    }catch(err){
        console.error('Errore nel caricamento dati:', err);
        tableContainer.textContent = 'Errore nel caricamento dati.';
    }   
}

function renderTH(table){
    const thead = document.createElement('thead');
    thead.innerHTML = `
            <tr>
                <th>Tabella oraria</th>
                <th>Mezzo</th>
                <th>Posizione?</th>
            </tr>
        `;
    table.appendChild(thead);
}

function renderElement(tbody, element, idx){
    const tr = document.createElement('tr');
    if (element.is_GPS) {
        element.is_GPS = "Si";
    } else {
        element.is_GPS = "No";
    }
    tr.innerHTML = `
        <td>${element.vehicle_table}</td>
        <td>${element.vehicle}</td>
        <td>${element.is_GPS}</td>
    `;
    if (idx % 2 != 0) {
        tr.className = "even";
    }
    tbody.appendChild(tr);
}