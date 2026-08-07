const API_ENDPOINT = "https://ertpl-api.vichingo455.com/startnews";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const newsContainer = document.getElementById('news-container');

//Vars
const trimCh = 48;
const forceTrimCh = 56;

newsContainer.innerHTML = "<p>Caricamento notizie...</p>";
getApiUrl().then(url => {
fetch(url + "/feed")
    .then(response => {
        if (!response.ok){
            newsContainer.innerHTML = "<p>Impossibile raggiungere l'API.</p>";
            throw new Error("Errore nel caricamento dei dati.");
        } 
        return response.json();
    }).then(data =>{
        newsContainer.innerHTML="";
        data.items.forEach(element => {
            var div = document.createElement('div');
            div.setAttribute("class","news-card");
            var a = document.createElement('a');
            var h3 = document.createElement('h3');
            var p = document.createElement('p');
            var span = document.createElement('span');
            
            if(data.title.includes("Info")) {
                span.textContent = "Infobus";
            } else {
                span.textContent = "News";
            }
            p.textContent = formatShortDate(element.published) + " - ";
            p.appendChild(span);

            //Very roughly cuts title to prevent overflow from the card
            const trimmedTitle = trimTitle(element.title);
            h3.textContent = trimmedTitle;

            //Link creation
            const link = "/start_menu/servizi/notizie/notizia.html?link=" + encodeURIComponent(element.link);
            a.setAttribute("href",link);
            a.appendChild(p);
            a.appendChild(h3);
            div.appendChild(a);
            newsContainer.appendChild(div);
        });
    })})

function trimTitle(title){
    if(title.length<forceTrimCh){
        return title;
    }
    const nextSpace = charsBeforeSpace(title);
    if(forceTrimCh>nextSpace){
        return title.slice(0,nextSpace)+"...";
    }
    return title.slice(0,forceTrimCh)+"...";

    function charsBeforeSpace(title){
        for(var i=trimCh;i<title.length;i++){
            if(title.charAt(i)==" "){
                return i;
            }
        }
    }
}

function formatShortDate(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}