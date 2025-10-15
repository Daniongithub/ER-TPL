const params = new URLSearchParams(window.location.search);
const num = params.get('routenum');
const lineaSpan = document.getElementById('linea-span');

const urlDesc = "https://setaapi.serverissimo.freeddns.org/frequencydescription/"+num;

//Display numero linea
lineaSpan.innerHTML=num;

//Contenuto del testo
fetch(urlDesc)