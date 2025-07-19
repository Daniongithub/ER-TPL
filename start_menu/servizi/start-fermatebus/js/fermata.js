const params = new URLSearchParams(window.location.search);
const palina = params.get('palina');
const targetID = params.get('targetID');
const selectedOption = params.get('selectedOption');

//const urlBackend = `https://api.vichingo455.freeddns.org/start-fermatebus.json/?param=${targetID}&param2=${selectedOption}&palina=${palina}`;
const urlBackend = `https://api.allorigins.win/get?url=${encodeURIComponent('http://balledelmona.keenetic.link:3005/?param=36&param2=ra&palina=700050')}`;
//const urlBackend = `http://localhost:3005/?param=${targetID}&param2=${selectedOption}&palina=${palina}`;
function caricadati(){
    fetch(urlBackend)
    .then(res => res.json())
    .then(data => {
        const fermata_span = document.getElementById('fermata-span');
        fermata_span.innerHTML = `"${data[0].fermata}"`;
        const container = document.getElementById('tabella-container');
        container.innerHTML = '';

        if (!data || data.length === 0) {
            container.textContent = 'Nessun dato trovato.';
            return;
        }

        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
        const thead = document.createElement('thead');
        thead.innerHTML = `
                    <tr>
                        <th>Linea</th>
                        <th>Destinazione</th>
                        <th>Orario</th>
                        <th>Stato attuale</th>
                        <th>Veicolo</th>
                        <th>Soppressa</th>
                    </tr>
                `;
        table.appendChild(thead);

        // Corpo tabella
        const tbody = document.createElement('tbody');
        data.slice(1).forEach(item => {
            const tr = document.createElement('tr');
            if (item.soppressa) {
                tr.classList.add('bus-card-red');
            }
            tr.innerHTML = `
                        <td>${item.linea}</td>
                        <td>${item.destinazione}</td>
                        <td>${item.orario}</td>
                        <td>${item.stato}</td>
                        <td>${item.mezzo}</td>
                        <td>${item.soppressa ? 'Sì' : 'No'}</td>
                    `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        container.appendChild(table);
    })
    .catch(err => {
        console.error('Errore nel caricamento dati:', err);
        document.getElementById('tabella-container').textContent = 'Errore nel caricamento dati.';
    });
}

caricadati();

setInterval(caricadati, 60000);