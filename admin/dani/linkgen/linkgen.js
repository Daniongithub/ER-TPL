function generatd() {
    const link = document.getElementById("link").value.trim();

    if (!link) {
        alert("Compila i campi.");
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
        const htmlString = `<td><a><img data-path="${path}" alt="Caricamento in corso..."></a></td>`;

        document.getElementById("output").textContent = htmlString;

    } catch (error) {
        alert("URL non valido.");
    }
}

function generaimg() {
    const flag = document.getElementById("flag");
    var link = document.getElementById("link").value.trim();
    if (!link) {
        alert("Compila i campi.");
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

        let class1 = "class=\"bus\"";
        let class2 = "class=\"copertina\" width=\"500vw\"";
        let classe = (flag.checked) ? class2 : class1;

        const htmlString = `<img ${classe} data-path="${path}" alt="Caricamento in corso...">`;

        document.getElementById("output").textContent = htmlString;

    } catch (error) {
        alert("URL non valido.");
    }
}

function copiaOutput() {
    const code = document.getElementById("output").textContent;
    navigator.clipboard.writeText(code);
}

function pulisci() {
    document.getElementById("link").value = "";
    document.getElementById("output").textContent = "";
}