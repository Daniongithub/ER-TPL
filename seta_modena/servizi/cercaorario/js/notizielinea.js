const API_ENDPOINT = "https://ertpl-api.vercel.app/seta";

async function getApiUrl() {
  const res = await fetch(API_ENDPOINT);
  const cfg = await res.json();
  if (cfg.status !== "ok") return null;
  return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const num = params.get('routenum');
const newsContainer = document.getElementById('notizie-container');
const lineaSpan = document.getElementById('linea-span');

//Urls
//const url = "https://setaapi.serverissimo.freeddns.org/routeproblems/"+num;

//Display numero linea
lineaSpan.textContent=num;

//Spawn product card
getApiUrl().then(url => {
fetch(url + "/routeproblems/" + num)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        newsContainer.innerHTML='';
        data.problems.forEach(element => {
            var div = document.createElement("div");
            div.setAttribute("class","news-card");
            var p = document.createElement('p');
            var h3 = document.createElement('h3');
            var a = document.createElement('a');
            const link = "/seta_modena/menu/notizia.html?link="+element.link;
            a.setAttribute("href",link);
            a.setAttribute("class","bianco");
            p.innerHTML=element.date;
            h3.innerHTML=element.title;
            a.appendChild(p);
            a.appendChild(h3);
            div.appendChild(a);
            newsContainer.appendChild(div);
        });
    })})