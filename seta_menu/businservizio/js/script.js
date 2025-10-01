const lineaSelect = document.getElementById('linea');
const modelloSelect = document.getElementById('modello');
const contentBackground = document.getElementById('content-background');

let allresults = [];
const urlList="https://setaapi.serverissimo.freeddns.org/busesinservice";

//Reperire modelli e numeri linea

const urlRoutes = 'https://setaapi.serverissimo.freeddns.org/routenumberslist';
//const urlRoutes = 'http://localhost:5001/stoplist';
const urlModels = 'https://setaapi.serverissimo.freeddns.org/busmodels';
//const urlModels = 'http://localhost:5001/stoplist';

//Fetch routes and models and fill the selects
fetch(urlRoutes)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        allresults = data;
        allresults.forEach(route => {
            const option = document.createElement('option');
            option.value = route;
            option.textContent = route;
            lineaSelect.appendChild(option);
        });
    })
    .catch(error => {console.error('Errore nel caricamento dei dati:', error)});
fetch(urlModels)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        allresults = data;
        allresults.forEach(model => {
            const option = document.createElement('option');
            if(
                model!="CAM New Busotto"&&
                model!="Iveco Cityclass CNG"&&
                model!="Irisbus Cityclass CNG ex Pavia"&&
                model!="Mercedes Integro O550 (Giallo)"
            ){
                option.value = modelsDictionary(model);
                option.textContent = model;
                modelloSelect.appendChild(option);
            }
        });
    })
    .catch(error => {console.error('Errore nel caricamento dei dati:', error)});


function modelsDictionary(model){
    return model;
    //Non serve piu! :D
    /*
    if(model=="Irisbus Citelis CNG EEV"){
        return "Irisbus Citelis CNG";
    }
    if(model=="Irisbus Crossway"){
        return "Irisbus Crossway";
    }
    if(model=="Irisbus Crossway ex Esercito Tedesco"){
        return "Irisbus Crossway Esercito";
    }
    if(model=="Iveco Urbanway Mild Hybrid 2022"){
        return "Iveco Urbanway Mild Hybrid CNG";
    }
    if(model=="MenariniBus Citymood LNG"){
        return "Menarinibus Citymood LNG";
    }
    if(model=="MenariniBus Citymood CNG"){
        return "Menarinibus Citymood CNG";
    }
    if(model=="Iveco Crossway LE 12 CNG"){
        return "Iveco Crossway LE CNG";
    }
    if(model=="Iveco Crossway LE"){
        return "Iveco Crossway LE Diesel";
    }
    if(model=="Iveco Crossway Line"){
        return "Iveco Crossway Line";
    }
    if(model=="Mercedes Integro O550"||model=="Mercedes Integro O550 (Giallo)"){
        return "Mercedes Integro";
    }
    if(model=="Scania Irizar i4 LNG"){
        return "Irizar i4 LNG";
    }
    if(model=="Solaris Urbino 12 III CNG"){
        return "Solaris Urbino 12 CNG";
    }
    if(model=="Iveco Crossway Line 12 CNG"){
        return "Iveco Crossway Line CNG";
    }
    if(model=="MAN Lion's Regio"){
        return "MAN Lion's Regio";
    }
    if(model=="Setra S415 LE 2p ex Bolzano"){
        return "Setra ex Bolzano (2 porte)";
    }
    if(model=="Setra S415 LE 3p ex Bolzano"){
        return "Setra ex Bolzano (3 porte)";
    }
    if(model=="Iveco Crossway LE 14"){
        return "Iveco Crossway LE 14m";
    }
    if(model=="MAN Lion's City 19 CNG"){
        return "New MAN Lion's City 19G";
    }
    if(model=="Solaris Trollino 12 IV"){
        return "Solaris Trollino 12";
    }
    if(model=="Irisbus Cityclass CNG ATCM"){
        return "Irisbus Cityclass CNG ATCM";
    }
    if(model=="Mercedes Citaro O530N CNG"){
        return model;
    }
    if(model=="Iveco Crossway LE 14"){
        return "Iveco Crossway LE 14m";
    }
    if(model=="Iveco Crossway LE 14"){
        return "Iveco Crossway LE 14m";
    }
    if(model=="Iveco Crossway LE 14"){
        return "Iveco Crossway LE 14m";
    }
    if(model=="Iveco Crossway LE 14"){
        return "Iveco Crossway LE 14m";
    }
    */
}

caricadati();
var refreshGeneraleID=setInterval(caricadati, 60000);

function caricadati(){
    fetch(urlList)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        item = data.features;
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
                        <th class="linea">Linea</th>
                        <th class="direzione">Direzione</th>
                        <th class="orario">Veicolo</th>
                        <th class="stato">Modello veicolo</th>
                        <th class="veicolo">Ora si trova a</th>
                    </tr>
                `;
        table.appendChild(thead);

        // Corpo tabella
        const tbody = document.createElement('tbody');
        item.forEach(item => {
            const element = item.properties;
            const tr = document.createElement('tr');
            if(element.next_stop==null){
                var posizione="";
            }else{
                var posizione=element.next_stop;
            }
            tr.innerHTML = `
                <td>${element.linea}</td>
                <td>${element.route_desc}</td>
                <td><a href="infoveicolo.html?id=${element.vehicle_code}" class="bianco">${element.vehicle_code}</a></td>
                <td>${element.model}</td>
                <td>${posizione}</td>
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

//FILTRI
var intervalFiltrati = 0;
//Filtro per linea
lineaSelect.addEventListener('change', function(event) {
    if(intervalFiltrati!=undefined){
        //alert("Non è possibile usare due filtri allo stesso momento")
        clearInterval(intervalFiltrati);
    }
    const selectedOption = event.target.value;
    caricaFiltratiLinea(selectedOption);
    intervalFiltrati = setInterval(function dummyFunc(){caricaFiltratiLinea(selectedOption);}, 60000);
    clearInterval(refreshGeneraleID);
    if(document.getElementById("reimposta-filtro")==undefined){
        const reimpostaFiltro = document.createElement('p');
        reimpostaFiltro.setAttribute("style","margin-bottom: 0; font-size: 14px;");
        reimpostaFiltro.setAttribute("id","reimposta-filtro");
        reimpostaFiltro.innerHTML = `
                <a href="" class="biancosott">Reimposta il filtro</a>
            `;
        contentBackground.appendChild(reimpostaFiltro);
    }
});

//Filtro per modello
modelloSelect.addEventListener('change', function(event) {
    if(intervalFiltrati!=undefined){
        //alert("Non è possibile usare due filtri allo stesso momento")
        clearInterval(intervalFiltrati);
    }
    const selectedOption = event.target.value;
    caricaFiltratiModello(selectedOption);
    intervalFiltrati = setInterval(function dummyFunc(){caricaFiltratiModello(selectedOption);}, 60000);
    clearInterval(refreshGeneraleID);
    if(document.getElementById("reimposta-filtro")==undefined){
        const reimpostaFiltro = document.createElement('p');
        reimpostaFiltro.setAttribute("style","margin-bottom: 0; font-size: 14px;");
        reimpostaFiltro.setAttribute("id","reimposta-filtro");
        reimpostaFiltro.innerHTML = `
                <a href="" class="biancosott">Reimposta il filtro</a>
            `;
        contentBackground.appendChild(reimpostaFiltro);
    }
});

function reloadFiltratiLinea(){
    caricaFiltratiLinea(lineaSelect.value);
}

function caricaFiltratiLinea(selectedOption){
    const container = document.getElementById('tabella-container');
    container.innerHTML = 'Caricamento dati...';
    fetch(urlList)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data=>{
        container.innerHTML = '';
        //Sostituisco il pulsante aggiorna tutti col pulsante aggiorna filtrati
        const aggiornaNav = document.getElementById('nav-inservizio');
        aggiornaNav.innerHTML = `
            <ul>
                <li><a href="/index.html"><h1 style="font-size: 100%;font-weight: 500;">Home</h1></a></li>
                <li><a href="/seta_menu/seta.html"><h1 style="font-size: 100%;font-weight: 500;">SETA Modena</h1></a></li>
            </ul>
            <ul style="flex:1;justify-content: right;">
                <li><a href="javascript:reloadFiltratiLinea();"><h1 style="font-size: 16px;font-weight: 500;">Aggiorna</h1></a></li>
            </ul>
        `;
        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
        const thead = document.createElement('thead');
        thead.innerHTML = `
                    <tr>
                        <th class="linea">Linea</th>
                        <th class="direzione">Direzione</th>
                        <th class="orario">Veicolo</th>
                        <th class="stato">Modello veicolo</th>
                        <th class="veicolo">Ora si trova a</th>
                    </tr>
                `;
        table.appendChild(thead);
        data.features.forEach(elements => {
            // Extract only the numeric part
            const number = elements.properties.linea.match(/\d+/g);
            if(number==selectedOption){
                const tbody = document.createElement('tbody');
                const element = elements.properties;
                const tr = document.createElement('tr');
                if(element.next_stop==null){
                    var posizione="";
                }else{
                    var posizione=element.next_stop;
                }
                tr.innerHTML = `
                    <td>${element.linea}</td>
                    <td>${element.route_desc}</td>
                    <td><a href="infoveicolo.html?id=${element.vehicle_code}" class="bianco">${element.vehicle_code}</a></td>
                    <td>${element.model}</td>
                    <td>${posizione}</td>
                `;
                tbody.appendChild(tr);
                table.appendChild(tbody);

                container.appendChild(table);
                console.log("Ricarico");
            }else{
                container.appendChild(table);
            }
        });
    });
}

function caricaFiltratiModello(selectedOption){
    const container = document.getElementById('tabella-container');
    container.innerHTML = 'Caricamento dati...';
    fetch(urlList)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data=>{
        container.innerHTML = '';
        //Sostituisco il pulsante aggiorna tutti col pulsante aggiorna filtrati
        const aggiornaNav = document.getElementById('nav-inservizio');
        aggiornaNav.innerHTML = `
            <ul>
                <li><a href="/index.html"><h1 style="font-size: 100%;font-weight: 500;">Home</h1></a></li>
                <li><a href="/seta_menu/seta.html"><h1 style="font-size: 100%;font-weight: 500;">SETA Modena</h1></a></li>
            </ul>
            <ul style="flex:1;justify-content: right;">
                <li><a href="javascript:reloadFiltratiModello();"><h1 style="font-size: 16px;font-weight: 500;">Aggiorna</h1></a></li>
            </ul>
        `;
        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
        const thead = document.createElement('thead');
        thead.innerHTML = `
                    <tr>
                        <th class="linea">Linea</th>
                        <th class="direzione">Direzione</th>
                        <th class="orario">Veicolo</th>
                        <th class="stato">Modello veicolo</th>
                        <th class="veicolo">Ora si trova a</th>
                    </tr>
                `;
        table.appendChild(thead);
        data.features.forEach(elements => {
            if(elements.properties.model==selectedOption){
                const tbody = document.createElement('tbody');
                const element = elements.properties;
                const tr = document.createElement('tr');
                if(element.next_stop==null){
                    var posizione="";
                }else{
                    var posizione=element.next_stop;
                }
                tr.innerHTML = `
                    <td>${element.linea}</td>
                    <td>${element.route_desc}</td>
                    <td><a href="infoveicolo.html?id=${element.vehicle_code}" class="bianco">${element.vehicle_code}</a></td>
                    <td>${element.model}</td>
                    <td>${posizione}</td>
                `;
                tbody.appendChild(tr);
                table.appendChild(tbody);

                container.appendChild(table);
                console.log("Ricarico");
            }else{
                container.appendChild(table);
            }
        });
    });
}

function reloadFiltratiModello(){
    caricaFiltratiModello(modelloSelect.value);
}