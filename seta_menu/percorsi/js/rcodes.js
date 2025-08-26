const params = new URLSearchParams(window.location.search);
const container = document.getElementById('res-container');
const id = params.get('routenum');

const url = "https://setaapi.serverissimo.freeddns.org/routecodesarchive";

//Elenco linee urbano
fetch(url)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        allresults = data;
        allresults.forEach(element => {
            if(id==element.linea){
                element.codes.forEach(item =>{
                    const result = document.createElement('a');
                    const dest = routesDictionary(item);
                    result.setAttribute("class","bianco");
                    result.setAttribute("href","percorso.html?routecode="+item);
                    if(dest==undefined){
                        result.innerHTML = `
                            <div class="search-result"><h3 style="margin-left: 4px;margin-right: 4px;">${item}</h3>
                        `;
                    }else{
                        result.innerHTML = `
                            <div class="search-result"><h3 style="margin-left: 4px;margin-right: 4px;">${dest} <br> (${item})</h3>
                        `;
                    }
                    container.appendChild(result);
                })
            }
        });
    })
    .catch(error => console.error('Errore nel caricamento dei dati:', error));

function routesDictionary(rcode){
    switch(rcode){
        //Linea 1
        case "MO1-As-153":
            return "1 MARINUZZI DA ARIETE";
        case "MO1-Di-146":
            return "1 VILLAGGIO ZETA DA MARINUZZI";
        case "MO1-As-150":
            return "1A MODENA EST DA V.ZETA";
        case "MO1-As-154":
            return "1 MARINUZZI DA V.ZETA";
        case "MO1-Di-147":
            return "1B ARIETE DA MODENA EST";
        //Linea 2
        case "MO2-As-220":
            return "2 SAN DAMASO";
        case "MO2-Di-269":
            return "2 SANT'ANNA DA SAN DAMASO";
        case "MO2-Di-270":
            return "2 SANT'ANNA DA SAN DONNINO";
        case "MO2-As-271":
            return "2A SAN DONNINO";
        //Linea 3
        case "MO3-As-343":
            return "3A VACIGLIO-MATTARELLA";
        case "MO3-Di-318":
            return "3 MONTEFIORINO";
        case "MO3-As-348":
            return "3 MATTARELLA";
        //Linea 4
        case "MO4-As-434":
            return "4 GALILEI";
        case "MO4-Di-437":
            return "4 VACIGLIO NORD";
        
    }
}