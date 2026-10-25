const API_ENDPOINT = "https://ertpl-api.vichingo455.com/mezzi";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const container = document.getElementById('contenitore');

getApiUrl().then(url => {
    fetch(url + "/list/START")
        .then(response => response.json())
        .then(data => {
            container.innerHTML = '';

            // Crea la tabella
            const table = document.createElement('table');

            // Aggiungi l'intestazione della tabella
            let th = document.createElement('th');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');
            const rowh = document.createElement('tr');

            th.innerHTML = 'Matricola';
            rowh.appendChild(th);
            th = document.createElement('th');
            th.innerHTML = 'Targa';
            rowh.appendChild(th);
            th = document.createElement('th');
            th.innerHTML = 'Mezzo';
            rowh.appendChild(th);
            th = document.createElement('th');
            th.innerHTML = 'Bacino';
            rowh.appendChild(th);
            th = document.createElement('th');
            th.innerHTML = 'Rilevato il';
            rowh.appendChild(th);
            thead.appendChild(rowh);
            table.appendChild(thead);

            data.forEach((row, idx) => {
                const rowt = document.createElement('tr');
                if (row.status) {
                    rowt.classList.add(row.status);
                }

                const matr = document.createElement('td');
                const link = document.createElement('a');
                link.textContent = row.number;
                link.href = row.link;
                matr.appendChild(link);
                rowt.appendChild(matr);

                const targa = document.createElement('td');
                targa.textContent = row.plate_num;
                rowt.appendChild(targa);

                const mezzo = document.createElement('td');
                mezzo.textContent = row.model;
                rowt.appendChild(mezzo);

                const bacino = document.createElement('td');
                bacino.textContent = row.basin;
                rowt.appendChild(bacino);

                const rilevato = document.createElement('td');
                let ISOdate = new Date(row.last_seen);
                    const rilevamento =
                        ISOdate.toLocaleDateString("it-IT", {
                            hour: "2-digit",
                            minute: "2-digit"
                        })

                if(row.last_seen) {
                    rilevato.textContent = rilevamento
                }
                rowt.appendChild(rilevato);
                
                tbody.appendChild(rowt);
            });
            table.appendChild(tbody);

            container.appendChild(table);
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = `<p>Errore nel caricamento dei dati. Potrebbe essere un problema di rete, o un problema con la nostra API. Per favore <a href="#" onclick="loadMezzi();">riprova adesso</a> o riprova più tardi.</p>`;
        });
});