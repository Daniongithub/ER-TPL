const API_ENDPOINT = "https://ertpl-api.vercel.app/tper";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

//Vars
const trimCh = 48;
const forceTrimCh = 56;
// Carica le notizie
function loadNews(category){
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML="<p>Caricamento notizie...</p>";
    var uri = "";
    try {
        if (category == "principali") {
            uri = "/news";
        } else if (category == "bologna") {
            uri = "/news/bologna";
        } else if (category == "ferrara") {
            uri = "/news/ferrara";
        } else if (category == "ferrovie") {
            uri = "/news/ferrovie";
        } else {
            newsContainer.innerHTML="<p>Errore.</p>";
            throw new Error("Errore nel caricamento dei dati.");
        }
        getApiUrl().then(url => {
        fetch(url + "/news")
            .then(response => {
                if (!response.ok){
                    newsContainer.innerHTML="<p>Impossibile raggiungere l'API.</p>";
                    throw new Error("Errore nel caricamento dei dati.");
                } 
                return response.json();
            }).then(data =>{
                newsContainer.innerHTML="";
                data.sort((a, b) => {
                    const parseDate = (d) => {
                        const parts = d.split('.');
                        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    };
                    return parseDate(b.date) - parseDate(a.date);
                });
                data.forEach(element => {
                    var div = document.createElement('div');
                    div.setAttribute("class","news-card");
                    var a = document.createElement('a');
                    var h3 = document.createElement('h3');
                    var p = document.createElement('p');
                    if (category != "principali") {
                        p.innerHTML=element.date+' - '+category.charAt(0).toUpperCase()+category.slice(1);
                    }
                    else {
                        p.innerHTML=element.date+' - Notizie principali';
                    }
                    const trimmedTitle = trimTitle(element.title);
                    h3.innerHTML=trimmedTitle;
                    const link = "/tper_menu/notizie/notizia.html?link="+element.link;
                    a.setAttribute("href",link);
                    a.appendChild(p);
                    a.appendChild(h3);
                    div.appendChild(a);
                    newsContainer.appendChild(div);
                });
            })})
    } catch {}
}

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

function changeCategory(category){
    if (category == "principali") {
        document.getElementById('newstext').innerText = "Notizie principali:";
    } else if (category == "bologna") {
        document.getElementById('newstext').innerText = "Notizie di Bologna:";
    } else if (category == "ferrara") {
        document.getElementById('newstext').innerText = "Notizie di Ferrara:";
    } else if (category == "ferrovie") {
        document.getElementById('newstext').innerText = "Notizie sul trasporto ferroviario:";
    } else {
        console.log("Ricevuta richiesta per cambio di categoria con parametro non valido.");
        return;
    }
    loadNews(category);
}
changeCategory("principali");