const params = new URLSearchParams(window.location.search);
const bottoni = document.getElementById('buttons');
const posto = params.get('location');
const fermata_span = document.getElementById('fermata-span');

fermata_span.textContent=posto;

if(posto=="STAZIONE FS"){
    bottoni.innerHTML = `
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6132" class="bianco">
            <div class="search-result desc"><h3>Corsia 1</h3><p>Linee: 7</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6133" class="bianco">
            <div class="search-result desc"><h3>Corsia 2</h3><p>Linee: 1, 4, 9, 13</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6134" class="bianco">
            <div class="search-result desc"><h3>Corsia 3</h3><p>Linee: 1, 3, 4, 9</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6119" class="bianco">
            <div class="search-result desc"><h3>Corsia 4</h3><p>Linee: 3, 11, 13</p></div>
        </a>
    `;
}
if(posto=="MODENA AUTOSTAZIONE"){
    bottoni.innerHTML = `
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6121" class="bianco">
            <div class="search-result desc"><h3>Direzione Centro</h3><p>Linee: 1, 2, 4, 5, 6, 7, 13</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO5003" class="bianco">
            <div class="search-result desc"><h3>Lato Novi Park</h3><p>Linee: 1, 2, 4, 5, 7, 13</p></div>
        </a>
        <div></div>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6600" class="bianco">
            <div class="search-result desc"><h3>Davanti Biglietteria</h3><p>Linee: 6</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO10" class="bianco">
            <div class="search-result desc"><h3>Fianco Biglietteria</h3><p>Linee: 9, 10</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6120" class="bianco">
            <div class="search-result desc"><h3>Fianco Biglietteria lato Novi Park</h3><p>Linee: 9, 10</p></div>
        </a>
        <hr class="solid">
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO3" class="bianco">
            <div class="search-result"><h3>Corriere corsia 1</h3></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO303" class="bianco">
            <div class="search-result"><h3>Corriere corsia 2</h3></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO342" class="bianco">
            <div class="search-result"><h3>Corriere corsia 3</h3></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO344" class="bianco">
            <div class="search-result"><h3>Corriere corsia 4</h3></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO350" class="bianco">
            <div class="search-result"><h3>Corriere corsia 5</h3></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO346" class="bianco">
            <div class="search-result"><h3>Corriere corsia 6</h3></div>
        </a>
    `;
}
if(posto=="GARIBALDI"){
    bottoni.innerHTML = `
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO5900" class="bianco">
            <div class="search-result desc"><h3>Direzione Centro</h3><p>Linee: 4, 7, 8</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO30" class="bianco">
            <div class="search-result desc"><h3>Direzione Trento Trieste</h3><p>Linee: 4, 7, 8</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO9" class="bianco">
            <div class="search-result desc"><h3>Lato Caduti in Guerra</h3><p>Linee: 3, 12</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO5111" class="bianco">
            <div class="search-result desc"><h3>Storchi direzione Trento Trieste</h3><p>Linee: 2, 3, 12</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO5112" class="bianco">
            <div class="search-result desc"><h3>Storchi direzione Centro</h3><p>Linee: 2</p></div>
        </a>
    `;
}
if(posto=="POLO LEONARDO"){
    bottoni.innerHTML = `
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6783" class="bianco">
            <div class="search-result"><h3>POLO LEONARDO (Strada)</h3><p>Linee: 1A, 4, 10, 12</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO2928" class="bianco">
            <div class="search-result"><h3>POLO LEONARDO 1</h3><p>Linee: 1A, 4, 10, 12</p></div>
        </a>
        <hr class="solid">
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO218" class="bianco">
            <div class="search-result"><h3>Corsia 1</h3><p>Linee: 12, 391</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO228" class="bianco">
            <div class="search-result"><h3>Corsia 2</h3><p>Linee: 731, 740</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO224" class="bianco">
            <div class="search-result"><h3>Corsia 3</h3><p>Linee: 815, 820</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO217" class="bianco">
            <div class="search-result"><h3>Corsie 5, 6, 7</h3><p>Linee: 392, 393</p></div>
        </a>
    `;
}