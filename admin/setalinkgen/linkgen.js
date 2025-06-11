function generatd() {
    const matricola = document.getElementById("matricola").value.trim();
    var link = document.getElementById("link").value.trim();

    if (!matricola || !link) {
        alert("Compila entrambi i campi.");
        return;
    }

    try {
        link = "https://drive.serverissimo.freeddns.org/apps/files_sharing/publicpreview/ffdqobqRg2ezKXt?file=/Leo/SETA/"+link+"/"+matricola;

        const linkFinaleNoTrue = link+".jpg&x=1920&y=1080"
        const linkFinaleTrue = link+".jpg&x=1920&y=1080&a=true"
        const htmlString = "<td><a href=\""+linkFinaleTrue+"\"><img src=\""+linkFinaleNoTrue+"\"alt=\"Server foto non raggiungibile.\"></a></td>";

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