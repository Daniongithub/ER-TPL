const tableContainer = document.getElementById('table-container');

//URL (local file)
const url = "/seta_modena/menu/js/setabus.json";

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
            case "Sconosciuto":
                tr.className="sconosciuto";
                break;
            case "Fermo":
                tr.className="fermo";
                break;
            case "Dismesso":
                tr.className="dismesso";
                break;
            case "Demolito":
                tr.className="demolito";
                break;
        }

        tr.innerHTML = `
            <td><a href="${bus.link}">${bus.matricola}</a></td>
            <td>${bus.modello}</td>
            <td>${bus.settore}</td>
        `;

        table.appendChild(tr)
    });
    tableContainer.appendChild(table);
})