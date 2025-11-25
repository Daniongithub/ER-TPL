const newsContainer = document.getElementById('news-container');

//URL
const newsURL = "https://setaapi.serverissimo.freeddns.org/allnews";

//Vars
const trimWidth = 250;
const trimMargins = 16;
const trimLines = 2;

newsContainer.innerHTML="<p>Caricamento notizie...</p>";
fetch(newsURL)
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
            if(element.type=="Importante"){
                span.setAttribute("class","red");
            }
            if(element.type=="Informazione"){
                span.setAttribute("class","yellow");
            }
            if(element.type=="Novità"){
                span.setAttribute("class","green");
            }
            if(element.type=="Orari"){
                span.setAttribute("class","yellow");
            }
            if(element.type=="Autobus Treno"){
                span.setAttribute("class","blue");
            }
            if(element.type=="Lavori in corso"){
                span.setAttribute("class","red");
            }
            if(element.type=="Biglietti"){
                span.setAttribute("class","blue");
            }
            if(element.type=="Personale"){
                span.setAttribute("class","blue");
            }
            //P creation
            span.innerHTML=element.type;
            p.innerHTML=element.date+" - ";
            p.appendChild(span);            
            h3.innerHTML=element.title;
            //Link creation
            const link = "/seta_modena/menu/notizia.html?link="+element.link;
            a.setAttribute("href",link);
            a.appendChild(p);
            a.appendChild(h3);
            div.appendChild(a);
            newsContainer.appendChild(div);
        });
    })