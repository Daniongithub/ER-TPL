const mezzo = document.getElementById("mezzo");
const matr = document.getElementById("matr");
const azienda = document.getElementById("azienda");
const linkAzienda = document.getElementById("linkAz");
const sezione = document.getElementById("sezione");
const linkSezione = document.getElementById("linkSez");

const output = document.getElementById("output");

function genera() {
    

    const template = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ER-TPL - ${mezzo.value}</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@200;300;400;600;700;900&display=swap" rel="stylesheet">
        <link rel="shortcut icon" href="/img/tablogo.png" type="image/x-icon">
    </head>
    <body>
        <script src="/scripts/ertpl.js"></script>
        <header>
            <nav>
                <ul>
                    <li><a href="/index.html"><h1 style="font-size: 100%;font-weight: 500;">Home</h1></a></li>
                    <li><a href="${linkAzienda.value}"><h1 style="font-size: 100%;font-weight: 500;">${azienda.value}</h1></a></li>
                    <li><a href="${linkSezione.value}"><h1 style="font-size: 100%;font-weight: 500;">${sezione.value}</h1></a></li>
                </ul>
            </nav>
        </header>
        <h1>${matr.value}<br>${mezzo.value}</h1>
        <p>DESCRIZIONE</p>
        <table class="image-table">
            <tr>
                <td id="" colspan="4"><h2>${matr.value}</h2></td>
            </tr>
        </table>
    </body>
    </html>
    `

    output.textContent = template;
}

function copiaOutput() {
    const code = document.getElementById("output").innerText;
    navigator.clipboard.writeText(code);
}

function pulisci() {
    mezzo.value = '';
    matr.value = '';
    azienda.value = '';
    linkAzienda.value = '';
    sezione.value = '';
    linkSezione.value = '';
    document.getElementById("output").innerHTML = "";
}