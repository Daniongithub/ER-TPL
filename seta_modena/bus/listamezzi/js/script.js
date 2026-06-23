const tableContainer = document.getElementById('table-container');

//URL (new remote DB)
//const url = "/seta_modena/menu/js/setabus.json";
const url = "https://dbiface.serverissimo.com/api/seta/mezzi";

//Create table
const table = document.createElement('table');

//Spawn table head
const thead = document.createElement('thead');
thead.innerHTML = `
    <th>Matricola</th>
    <th>Mezzo</th>
    <th>Tipo</th>
`;
table.appendChild(thead);

fetch(url)
.then(response => {
    if (!response.ok) {
        throw new Error("Errore nel caricamento dei dati.");
        tableContainer.innerHTML="<strong>Errore nella lettura dell'elenco mezzi.</strong>";
    }
    return response.json();
})
.then(data => {
    //Remove loading
    tableContainer.innerHTML='';

    //Fill the table
    data.forEach(bus => {
        const tr = document.createElement('tr');

        //Check vehicle status
        switch(bus.stato){
            case "sconosciuto":
                tr.className="sconosciuto";
                break;
            case "fermo":
                tr.className="fermo";
                break;
            case "dismesso":
                tr.className="dismesso";
                break;
            case "demolito":
                tr.className="demolito";
                break;
        }

        tr.innerHTML = `
            <td class="cursor-pointer" onclick="window.location.href='${bus.link}'">${bus.matricola}</td>
            <td>${bus.modello}</td>
            <td>${bus.settore}</td>
        `;

        table.appendChild(tr)
    });
    tableContainer.appendChild(table);
})