const params = new URLSearchParams(window.location.search);
const num = params.get('routenum');
const lineaSpan = document.getElementById('linea-span');
const iframe = document.getElementById('iframe');
const linkContainer = document.getElementById('link-a-seta');

const date = new Date();
const todayDate=date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();

const baseURL = "https://setaapi.serverissimo.freeddns.org/lineedyn_linea_dett_percorsi/?b=mo&l=MO"+num+"&dd="+todayDate+"&v=As";

//Display numero linea
lineaSpan.innerHTML=num;

//Spawn iframe
iframe.setAttribute("src",baseURL);
setTimeout(function(){}, 2000);

//Adatta altezza iframe da codice injectato
window.addEventListener("message", (event) => {
    if (event.origin !== "https://setaapi.serverissimo.freeddns.org/lineedyn_linea_dett_percorsi") return; // sicurezza
    if (event.data?.type === "resize") {
        frame.style.height = event.data.height + "px";
    }
});