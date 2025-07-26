const params = new URLSearchParams(window.location.search);
const nome = params.get('name');
const codice = params.get('code');

//Sets stop name
const fermata_span = document.getElementById('fermata-span');
fermata_span.innerHTML = `"${nome}"`;

const urlBackend = `https://setaapi.serverissimo.freeddns.org/arrivals/${codice}`;
//const urlBackend = `http://localhost:5001/arrivals/${codice}`;
function caricadati(){
    fetch(urlBackend)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        item = data.arrival;
    })
    .then(data => {
        
        const container = document.getElementById('tabella-container');
        container.innerHTML = '';

        if (item.error=="no arrivals scheduled in next 90 minutes") {
            container.innerHTML = '<h3>Nessuna corsa programmata nei prossimi 90 minuti.</h3>';
            return;
        }
        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
        const thead = document.createElement('thead');
        thead.innerHTML = `
                    <tr>
                        <th class="linea">Linea</th>
                        <th class="direzione">Direzione</th>
                        <th class="orario">Orario (Rit/Ant)</th>
                        <th class="stato">Stato corsa</th>
                        <th class="veicolo">Veicolo</th>
                        <th class="location">Ora si trova a:</th>
                    </tr>
                `;
        table.appendChild(thead);

        // Corpo tabella
        const tbody = document.createElement('tbody');
        item.services.forEach(item => {
            const tr = document.createElement('tr');
            if(item.type=="planned"){
                var stato="Prevista";
            }else{
                var stato="In tempo reale";
            }if(item.next_stop==null){
                var posizione="";
            }else{
                var posizione=item.next_stop;
            }
            if(item.delay==undefined){
                tr.innerHTML = `
                        <td>${item.service}</td>
                        <td>${item.destination}</td>
                        <td>${item.arrival}</td>
                        <td>${stato}</td>
                        <td>${item.busnum}</td>
                        <td>${posizione}</td>
                    `;
                tbody.appendChild(tr);
            }else{
                if(item.delay>0){
                    tr.innerHTML = `
                        <td>${item.service}</td>
                        <td>${item.destination}</td>
                        <td>${item.arrival} (+${item.delay})</td>
                        <td>${stato}</td>
                        <td>${item.busnum}</td>
                        <td>${posizione}</td>
                    `;
                    tbody.appendChild(tr);
                }else{
                    tr.innerHTML = `
                        <td>${item.service}</td>
                        <td>${item.destination}</td>
                        <td>${item.arrival} (${item.delay})</td>
                        <td>${stato}</td>
                        <td>${item.busnum}</td>
                        <td>${posizione}</td>
                    `;
                    tbody.appendChild(tr);
                }
            }
            
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