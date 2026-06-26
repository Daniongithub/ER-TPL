// ER-TPL - Dani
// *** BETA LISTA MEZZI! ***
// Attenzione, tutto ciò qui sotto è in fase di sviluppo, né definitivo.

const API_ENDPOINT = "https://ertpl-api.vercel.app/mezzi";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}


//const API_URL = getApiUrl() + "/start/mezzi";

loadMezzi();

function loadMezzi() {
    const container = document.getElementById('contenitore');
    getApiUrl().then(url => {
    fetch(url + "/start/mezzi")
    .then(response => response.json())
    .then(data => {
        container.innerHTML = ''; // Svuota il div prima di aggiungere la tabella

        // Crea la tabella
        const table = document.createElement('table');
        table.classList.add("lista-mezzi");

        // Aggiungi l'intestazione della tabella
        let th = document.createElement('th');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const rowh = document.createElement('tr');

        th.innerHTML='Matricola';
        rowh.appendChild(th);
        th = document.createElement('th');
        th.innerHTML='Targa';
        rowh.appendChild(th);
        th = document.createElement('th');
        th.innerHTML='Mezzo';
        rowh.appendChild(th);
        th = document.createElement('th');
        th.innerHTML='Bacino';
        rowh.appendChild(th);
        thead.appendChild(rowh);
        table.appendChild(thead);

        data.forEach(row => {
            const rowt = document.createElement('tr');
            if(row.stato) {
                rowt.classList.add(row.stato);
            }

            const matr = document.createElement('td');
            const link = document.createElement('a');
            link.textContent = row.matricola;
            link.href = row.link;
            matr.appendChild(link);
            rowt.appendChild(matr);

            const targa = document.createElement('td');
            targa.textContent = row.targa;
            rowt.appendChild(targa);

            const mezzo = document.createElement('td');
            mezzo.textContent = row.modello;
            rowt.appendChild(mezzo);

            const bacino = document.createElement('td');
            bacino.textContent = row.provincia;
            rowt.appendChild(bacino);

            tbody.appendChild(rowt);
        });
        table.appendChild(tbody);

        container.appendChild(table);
    })
    .catch(err => {
      container.innerHTML = `<p>Errore nel caricamento dei dati. Potrebbe essere un problema di rete, o un problema con la nostra API. Per favore <a href="#" onclick="loadMezzi();">riprova adesso</a> o riprova più tardi.</p>`;
    });

    });
}