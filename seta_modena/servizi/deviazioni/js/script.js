const params = new URLSearchParams(window.location.search);
const evento = params.get('type');
const nomeSpan = document.getElementById('nome-span');
const textContainer = document.getElementById('text-container');

//Display event title
switch(evento){
    case "partita":
        nomeSpan.textContent="partita di calcio";
        renderPartita();
        break;
    case "proma":
        nomeSpan.textContent="chiusura di Piazza Roma";
        renderProma();
        break;
}

function renderPartita(){
    textContainer.innerHTML=`
        Chiusura al transito di via Monte Kosica, via Berengario e via Fontanelli. <br> 
        Sono interessate le linee seguenti: <strong>1, 3, 4, 6, 7, 9, 10, 11, 12, 13</strong> <br> <br>

        <strong>Linea 1:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>

        <strong>Linea 4:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>

        <strong>Linea 7:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>

        <strong>Linea 9:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>

        <strong>Linea 10:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>

        <strong>Linea 11:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>

        <strong>Linea 13:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>
    `;
}

function renderProma(){
    textContainer.innerHTML=`
        Chiusura al transito di Piazza Roma. <br> 
        Sono interessate le linee seguenti: <strong>7A, 11</strong> <br> <br>

        <strong>Linea 7A:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>
        
        <strong>Linea 11:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> "Emilia Centro posta", Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> "Emilia Centro posta", viale Caduti in Guerra, Stazione FS. <br> <br>
        `;
}