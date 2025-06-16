function generatd() {
    const matricola = document.getElementById("matricola").value.trim();
    var numero = document.getElementById("numero").value.trim();
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
        
        if (numero === "") {
            numero = 1;
        }

        const htmlString = `<td><a id="${matricola}-link${numero}" href="${link}"><img id="${matricola}-img${numero}" src="${link}" onerror='this.onerror=null; changeUrlToFallback("${matricola}-link${numero}","${matricola}-img${numero}","${path}");' alt="Server foto non raggiungibile."></a></td>`;

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
    const mezzo = document.getElementById("mezzo").value.trim();
    var link = document.getElementById("link").value.trim();
    if (!mezzo || !link) {
        alert("Compila entrambi i campi.");
        return;
    }
    link = link.replace(/&a=true/, '');
    try {
        const urlObj = new URL(link);
        const params = new URLSearchParams(urlObj.search);
        const path = params.get("file");

        const htmlString = `<img id="${mezzo}" class="bus" src="${link}" onerror='this.onerror=null; changeUrlToFallbackNoTrue("","${mezzo}","${path}");' alt="Server foto non raggiungibile.">`;

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
    document.getElementById("numero").value = "";
    document.getElementById("link").value = "";
    document.getElementById("output").innerHTML = "";
}

function pulisciimg() {
    document.getElementById("mezzo").value = "";
    document.getElementById("link").value = "";
    document.getElementById("output").innerHTML = "";
}  