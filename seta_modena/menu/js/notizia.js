const params = new URLSearchParams(window.location.search);
const link = params.get('link');
const notiziaContainer = document.getElementById('notizia-container');

//URL
const newsURL = "https://setaapi.serverissimo.freeddns.org/news?link="+link;

notiziaContainer.innerHTML="<p>Caricamento notizia...</p>";
fetch(newsURL)
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
        var p = document.createElement('p');
        var p2 = document.createElement('p');
        p.innerHTML=element.date;
        h1.innerHTML=element.title;
        div.appendChild(p);
        div.appendChild(h1);
        p2.innerHTML=element.content;
        div.appendChild(p2);
        notiziaContainer.appendChild(div);
    })