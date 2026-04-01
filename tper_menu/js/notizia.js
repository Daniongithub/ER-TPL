const API_ENDPOINT = "https://ertpl-api.vercel.app/tper";

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
            throw new Error("Errore nel caricamento dei dati.");
        } 
        return response.json();
    }).then(element =>{
        notiziaContainer.innerHTML="";
        var div = document.createElement('div');
        var h1 = document.createElement('h1');
        var p2 = document.createElement('div');
        h1.innerHTML=element.title;
        div.appendChild(h1);
        if (element.allegati && element.allegati.length > 0) {
            var allegatiDiv = document.createElement('div');
            allegatiDiv.classList.add('allegati-section');
            
            var titleAllegati = document.createElement('h3');
            titleAllegati.innerText = "Allegati";
            allegatiDiv.appendChild(titleAllegati);

            element.allegati.forEach(allegato => {
                var a = document.createElement('a');
                a.href = allegato.link;
                a.target = "_blank";
                a.className = "allegato-link";
                
                // Usiamo il titolo dell'allegato, se manca mettiamo un default
                a.innerText = (allegato.titolo && allegato.titolo.trim() !== "") 
                            ? allegato.titolo 
                            : "Scarica allegato";

                allegatiDiv.appendChild(a);
                // Aggiungiamo un break o un div per mandarli a capo
                allegatiDiv.appendChild(document.createElement('br'));
            });
            
            div.appendChild(allegatiDiv);
        }
        p2.innerHTML=element.content;
        div.appendChild(p2);
        notiziaContainer.appendChild(div);
    })})