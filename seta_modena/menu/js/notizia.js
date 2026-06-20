const API_ENDPOINT = "https://ertpl-api.vercel.app/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const link = params.get('link');
const notiziaContainer = document.getElementById('notizia-container');

notiziaContainer.innerHTML="<p>Caricamento notizia...</p>";
getApiUrl().then(url => {
fetch(url + "/news?link=" + link)
    .then(response => {
        if (!response.ok){
            notiziaContainer.innerHTML="<p>Impossibile raggiungere l'API.</p>";
            if(response.status=="404"){
                notiziaContainer.innerHTML="<p>Errore HTTP 404 Not Found. Impossibile leggere la notizia.</p>";
            }
            throw new Error("Errore nel caricamento dei dati.");
        } 
        return response.json();
    }).then(element =>{
        notiziaContainer.innerHTML="";

        var div = document.createElement('div');
        var h1 = document.createElement('h1');
        var p = document.createElement('p');
        var p2 = document.createElement('p');

        p.innerHTML=element.date;
        h1.innerHTML=element.title;
        div.appendChild(p);
        div.appendChild(h1);

        p2.innerHTML=element.content;
        div.appendChild(p2);

        notiziaContainer.appendChild(div);

        //Controllo deviazioni per collegamento al servizio deviazioni nostro
        if(element.title.includes("chiusura al transito di piazza Roma")||element.title.includes("chiusura al transito di via Emilia centro")){
            const deviazioniP = document.createElement('p');

            deviazioniP.innerHTML=`<br> <strong>E' possibile consultare le deviazioni attive sul nostro servizio <a class="novita" href="/seta_modena/servizi/deviazioni/index.html">Deviazioni</a></strong>`;
            notiziaContainer.appendChild(deviazioniP);
        }
    })})