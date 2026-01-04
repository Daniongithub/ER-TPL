function generatd() {
    const matricola = document.getElementById("matricola").value.trim();
    var link = document.getElementById("link").value.trim();

    if (!matricola || !link) {
        alert("Compila entrambi i campi.");
        return;
    }try{
        //Nuovo td
        //<td><a><img data-path="/Fogli/TPER/TPER5630.jpg" alt="Caricamento in corso..."></a></td>
        link = "/Leo/SETA/"+link+"/"+matricola;

        const linkFinale = link+".jpg"
        const htmlString = "<td><a><img data-path=\""+linkFinale+"\" alt=\"Server foto non raggiungibile.\"></a></td>";

        const escapedOutput = htmlString
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        document.getElementById("output").innerHTML = escapedOutput;

    } catch (error) {
        alert("URL non valido.");
    }
}

function copiaOutput() {
    const code = document.getElementById("output").innerText;
    navigator.clipboard.writeText(code).then(() => {
        //alert("Codice copiato negli appunti!");
    }).catch(() => {
        alert("Errore durante la copia.");
    });
}

function pulisciimg() {
    document.getElementById("mezzo").value = "";
    document.getElementById("link").value = "";
    document.getElementById("output").innerHTML = "";
}  