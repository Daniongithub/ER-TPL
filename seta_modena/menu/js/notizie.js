const API_ENDPOINT = "https://ertpl-api.vichingo455.com/seta";

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

newsContainer.innerHTML="<p>Caricamento notizie...</p>";
getApiUrl().then(url => {
fetch(url + "/allnews")
    .then(response => {
        if (!response.ok){
            newsContainer.innerHTML="<p>Impossibile raggiungere l'API.</p>";
            throw new Error("Errore nel caricamento dei dati.");
        } 
        return response.json();
    }).then(data =>{
        newsContainer.innerHTML="";
        data.news.forEach(element => {
            var div = document.createElement('div');
            div.setAttribute("class","news-card");
            var a = document.createElement('a');
            var h3 = document.createElement('h3');
            var p = document.createElement('p');
            var span = document.createElement('span');

            switch (element.type) {
                case "Importante":
                case "Lavori in corso":
                    span.setAttribute("class", "red");
                    break;
                case "Informazione":
                case "Orari":
                    span.setAttribute("class", "yellow");
                    break;
                case "Novità":
                case "Agevolazioni":
                    span.setAttribute("class", "green");
                    break;
                case "Autobus Treno":
                case "Biglietti":
                case "Abbonamenti":
                    span.setAttribute("class", "blue");
                    break;
                case "Scuola":
                    span.setAttribute("class", "orange");
                    break;
            }
            
            //P creation
            span.innerHTML=element.type;
            p.innerHTML=element.date+" - ";
            p.appendChild(span);
            //Very roughly cuts title to prevent overflow from the card
            const trimmedTitle = trimTitle(element.title);
            h3.innerHTML=trimmedTitle;
            //Link creation
            const link = "/seta_modena/menu/notizia.html?link="+element.link;
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