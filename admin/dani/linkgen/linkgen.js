function generatd() {
    const matricola = document.getElementById("matricola").value.trim();
    const link = document.getElementById("link").value.trim();

    if (!matricola || !link) {
        alert("Compila entrambi i campi.");
        return;
    }

    try {
        const urlObj = new URL(link);
        const params = new URLSearchParams(urlObj.search);
        const path = params.get("file");

        if (!path) {
            alert("Parametro ?file= mancante nell'URL.");
            return;
        }
        const htmlString = `<td><a data-path="${path}"><img data-path="${path}" alt="Server foto non raggiungibile."></a></td>`;

        const escapedOutput = htmlString
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        document.getElementById("output").innerHTML = escapedOutput;

    } catch (error) {
        alert("URL non valido.");
    }
}

function generaimg() {
    var link = document.getElementById("link").value.trim();
    if (!link) {
        alert("Compila i campi.");
        return;
    }
    link = link.replace(/&a=true/, '');
    try {
        const urlObj = new URL(link);
        const params = new URLSearchParams(urlObj.search);
        const path = params.get("file");

        const htmlString = `<img class="bus" data-path="${path}" alt="Server foto non raggiungibile.">`;

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

function puliscitd() {
    document.getElementById("matricola").value = "";
    document.getElementById("link").value = "";
    document.getElementById("output").innerHTML = "";
}

function pulisciimg() {
    document.getElementById("link").value = "";
    document.getElementById("output").innerHTML = "";
}  