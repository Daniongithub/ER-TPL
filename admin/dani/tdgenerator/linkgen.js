function genera() {
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

        const htmlString = `<td><a id="${matricola}-link1" href="${link}"><img id="${matricola}-img1" src="${link}" onerror='this.onerror=null; changeUrlToFallback("${matricola}-link1","${matricola}-img1","${path}");' alt="Server foto non raggiungibile."></a></td>`;

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

function pulisci() {
    document.getElementById("matricola").value = "";
    document.getElementById("link").value = "";
    document.getElementById("output").innerHTML = "";
}
