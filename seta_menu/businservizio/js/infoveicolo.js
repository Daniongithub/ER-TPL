const params = new URLSearchParams(window.location.search);
const id = params.get('id');

//Sets stop name
const numero_span = document.getElementById('numero-span');
numero_span.textContent=id;

const urlBackend = `https://setaapi.serverissimo.freeddns.org/vehicleinfo/${id}`;
//const urlBackend = `http://localhost:5001/vehicleinfo/${id}`;
function caricadati(){
    var item=[];
    fetch(urlBackend)
    .then(response => {
        if (!response.ok) throw new Error("Errore di risposta nel caricamento dei dati, probabilmente il server API è offline.");
        return response.json();
    })
    .then(data => {
        item = data;
    })
    .then(data => {
        
        const container = document.getElementById('tabella-container');
        container.innerHTML = '';
        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
        const thead = document.createElement('thead');
        thead.innerHTML = `
                    <tr>
                        <th class="linea" colspan="2" style="text-align:center;">Informazioni veicolo:</th>
                    </tr>
                `;
        table.appendChild(thead);

        // Corpo tabella
        const tbody = document.createElement('tbody');
        item.features.forEach(element => {
            const bus = element.properties;
            var tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td class="uguale">Linea:</td>
                    <td class="uguale">${bus.linea}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Direzione:</td>
                    <td>${bus.route_desc}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Tipo linea:</td>
                    <td>${bus.service_tag}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            //Ritardo col +
            if(bus.delay>0){
                bus.delay="+"+bus.delay;
            }
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Ritardo/Anticipo: (+/-)</td>
                    <td>${bus.delay}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Numero mezzo:</td>
                    <td>${bus.vehicle_code}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Modello:</td>
                    <td>${bus.model}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Targa:</td>
                    <td>${bus.plate_num}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            //Si o no pedana
            if(bus.pedana==1){
                bus.pedana="Sì";
            }else{
                bus.pedana="No";
            }
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Pedana?:</td>
                    <td>${bus.pedana}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Ora si trova a:</td>
                    <td>${bus.next_stop}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Codice percorso:</td>
                    <td><a href="/seta_menu/percorsi/percorso.html?routecode=${bus.route_code}" class="bianco">${bus.route_code}</a></td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Codice corsa:</td>
                    <td><a href="/seta_menu/percorsi/prossimefermate.html?journeycode=${bus.journey_code}" class="bianco">${bus.journey_code}</a></td>
                </tr>
            `;
            tbody.appendChild(tr);
            //Colore sfondo conta passeggeri
            if(bus.num_passeggeri<=bus.posti_totali/4){
                tr = document.createElement('tr');
                tr.innerHTML = `
                    <tr>
                        <td class="bus-card-green">Numero passeggeri a bordo:</td>
                        <td class="bus-card-green">${bus.num_passeggeri}</td>
                    </tr>
                `;
            }else if(bus.num_passeggeri<=bus.posti_totali/1.8){
                tr = document.createElement('tr');
                tr.innerHTML = `
                    <tr>
                        <td class="bus-card-yellow">Numero passeggeri a bordo:</td>
                        <td class="bus-card-yellow">${bus.num_passeggeri}</td>
                    </tr>
                `;
            }else{
                tr = document.createElement('tr');
                tr.innerHTML = `
                    <tr>
                        <td class="bus-card-red">Numero passeggeri a bordo:</td>
                        <td class="bus-card-red">${bus.num_passeggeri}</td>
                    </tr>
                `;
            }if(bus.num_passeggeri==null){
                tr = document.createElement('tr');
                tr.innerHTML = `
                    <tr>
                        <td>Numero passeggeri a bordo:</td>
                        <td>Non disponibile</td>
                    </tr>
                `;
            }
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Numero posti totali (in piedi + sedili):</td>
                    <td>${bus.posti_totali}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Posizione:</td>
                    <td><a href="https://wimb.setaweb.it/qm/index.html?id=${bus.vehicle_code}">GPS</a></td>
                </tr>
            `;
            tbody.appendChild(tr);
            
        });
        table.appendChild(tbody);
        container.appendChild(table);
    })
    .catch(err => {
        console.error('Errore nel caricamento dati:', err);
        document.getElementById('tabella-container').textContent = "Errore nella sintassi dei dati ricevuti.";
    });
}

caricadati();

setInterval(caricadati, 60000);