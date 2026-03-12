const textH3 = document.getElementById('text-h3');
const buttonsContainer = document.getElementById('buttons-container');
const tableContainer = document.getElementById('table-container');
const resultsContainer = document.getElementById('results-container');

//Pagina corrente
//0 = Menù principale
//1 = Sottomenù qualsiasi
//2 = Risultati
var page = 0;

//Selection
var start = "";
var dest = "";

mainPage();

//Menù principale
function mainPage(){
    textH3.innerHTML = "Dove sei?";
    buttonsContainer.innerHTML = `
        <a class="green button" onclick="button1();">Autostazione</a>
        <a class="green button" onclick="button2();">Stazione FS</a>
        <a class="green button" onclick="button3();">Largo Garibaldi</a>
        <a class="green button" onclick="button4();">Stazione Piccola (FP)</a>
    `;
}

function renderTitle(start, dest){
    if(start)
    textH3.innerHTML = "Da "+start+" a "+dest;
}

function goBack(){
    page = page-1;
    resultsContainer.innerHTML="";
    if(page==0){
        mainPage();
    }else{
        switch(start){
            case "AUTOSTAZIONE":
                page = 0;
                button1();
                return;
            case "STAZIONE FS":
                page = 0;
                button2();
                return;
            case "LARGO GARIBALDI":
                page = 0;
                button3();
                return;
            case "FP":
                page = 0;
                button4();
                return;
        }
    }    
}

function button1(){
    if(page==0){
        start = "AUTOSTAZIONE";
        textH3.innerHTML = "Dove vuoi andare?";
        buttonsContainer.innerHTML = `
            <a class="green button" onclick="button2();">Stazione FS</a>
            <a class="green button" onclick="button3();">Largo Garibaldi</a>
            <a class="green button" onclick="button4();">Stazione Piccola (FP)</a> <br>
            <a class="red button" onclick="goBack();">Torna indietro</a>
        `;
        page = 1;
    }else{
        dest = "AUTOSTAZIONE";
        renderTitle(start, dest);
        buttonsContainer.innerHTML = ``;
        renderTable(start, dest);
        page = 2;
    }
}

function button2(){
    if(page==0){
        start = "STAZIONE FS";
        textH3.innerHTML = "Dove vuoi andare?";
        buttonsContainer.innerHTML = `
            <a class="green button" onclick="button1();">Autostazione</a>
            <a class="green button" onclick="button3();">Largo Garibaldi</a>
            <a class="green button" onclick="button4();">Stazione Piccola (FP)</a> <br>
            <a class="red button" onclick="goBack();">Torna indietro</a>
        `;
        page = 1;
    }else{
        dest = "STAZIONE FS";
        renderTitle(start, dest);
        buttonsContainer.innerHTML = ``;
        renderTable(start, dest);
        page = 2;
    }
}

function button3(){
    if(page==0){
        start = "LARGO GARIBALDI";
        textH3.innerHTML = "Dove vuoi andare?";
        buttonsContainer.innerHTML = `
            <a class="green button" onclick="button1();">Autostazione</a>
            <a class="green button" onclick="button2();">Stazione FS</a>
            <a class="green button" onclick="button4();">Stazione Piccola (FP)</a> <br>
            <a class="red button" onclick="goBack();">Torna indietro</a>
        `;
        page = 1;
    }else{
        dest = "LARGO GARIBALDI";
        renderTitle(start, dest);
        buttonsContainer.innerHTML = ``;
        renderTable(start, dest);
        page = 2;
    }
}

function button4(){
    if(page==0){
        start = "FP";
        textH3.innerHTML = "Dove vuoi andare?";
        buttonsContainer.innerHTML = `
            <a class="green button" onclick="button1();">Autostazione</a>
            <a class="green button" onclick="button2();">Stazione FS</a>
            <a class="green button" onclick="button3();">Largo Garibaldi</a> <br>
            <a class="red button" onclick="goBack();">Torna indietro</a>
        `;
        page = 1;
    }else{
        dest = "FP";
        renderTitle(start, dest);
        buttonsContainer.innerHTML = ``;
        renderTable(start, dest);
        page = 2;
    }
}

function renderTable(start, dest){
    switch(start){
        case "AUTOSTAZIONE":
            switch(dest){
                case "STAZIONE FS":
                    resultsContainer.innerHTML = `
                        1 MARINUZZI <br>
                        1A MODENA EST <br>
                        4 VACIGLIO NORD <br>
                        7 GRAMSCI <br>
                        9 GOTTARDI <br>
                        10 ALBARETO <br>
                        10A LA ROCCA <br>
                        13 SANT'ANNA <br>
                        13F SANT'ANNA
                        <div style="height:24px;"></div>
                        <a class="red button" onclick="goBack();">Torna indietro</a>
                    `;
                    return;
                case "LARGO GARIBALDI":
                    resultsContainer.innerHTML = `
                        2 SAN DAMASO <br>
                        2A SAN DONNINO <br>
                        4 VACIGLIO NORD <br>
                        7 POLICLINICO GOTTARDI <br>
                        <div style="height:24px;"></div>
                        <a class="red button" onclick="goBack();">Torna indietro</a>
                    `;
                    return;
                case "FP":
                    resultsContainer.innerHTML = `
                        Necessario scambio in <strong>Stazione FS</strong>
                        <div style="height:24px;"></div>
                        <a class="red button" onclick="goBack();">Torna indietro</a>
                    `;
                    return;
            }
            return;
        case "STAZIONE FS":
            switch(dest){
                case "AUTOSTAZIONE":
                    resultsContainer.innerHTML = `
                        1 ARIETE <br>
                        1A POLO LEONARDO <br>
                        4 GALILEI <br>
                        7 POLICLINICO GOTTARDI <br>
                        9A MARZAGLIA NUOVA <br>
                        9B VIRGILIO <br>
                        9C RUBIERA <br>
                        10 COGNENTO (Esterno) <br>
                        13 OSPEDALE BAGGIOVARA <br>
                        13F OSPEDALE BAGGIOVARA
                        <div style="height:24px;"></div>
                        <a class="red button" onclick="goBack();">Torna indietro</a>
                    `;
                    return;
                case "LARGO GARIBALDI":
                    resultsContainer.innerHTML = `
                        3A VACIGLIO <br>
                        3B RAGAZZI DEL 99 <br>
                        4 VACIGLIO NORD <br>
                        7 POLICLINICO GOTTARDI <br>
                        7A GOTTARDI
                        <div style="height:24px;"></div>
                        <a class="red button" onclick="goBack();">Torna indietro</a>
                    `;
                    return;
                case "FP":
                    resultsContainer.innerHTML = `
                        3A VACIGLIO <br>
                        3B RAGAZZI DEL 99
                        <div style="height:24px;"></div>
                        <a class="red button" onclick="goBack();">Torna indietro</a>
                    `;
                    return;
            }
            return;
        case "LARGO GARIBALDI":
            switch(dest){
                case "AUTOSTAZIONE":
                    resultsContainer.innerHTML = `
                        2 SANT'ANNA <br>
                        4 GALILEI <br>
                        7 GRAMSCI
                        <div style="height:24px;"></div>
                        <a class="red button" onclick="goBack();">Torna indietro</a>
                    `;
                    return;
                case "STAZIONE FS":
                    resultsContainer.innerHTML = `
                        3A S.CATERINA-MONTEFIORINO <br>
                        3A MONTEFIORINO <br>
                        3B NONANTOLANA 1010 <br>
                        4 GALILEI <br>
                        7 GRAMSCI <br>
                        7A GRAMSCI
                        <div style="height:24px;"></div>
                        <a class="red button" onclick="goBack();">Torna indietro</a>
                    `;
                    return;
                case "FP":
                    resultsContainer.innerHTML = `
                        3A VACIGLIO <br>
                        3B RAGAZZI DEL 99 <br>
                        12 POLO LEONARDO
                        <div style="height:24px;"></div>
                        <a class="red button" onclick="goBack();">Torna indietro</a>
                    `;
                    return;
            }
            return;
        case "FP":
            switch(dest){
                case "AUTOSTAZIONE":
                    resultsContainer.innerHTML = `
                        Necessario scambio in <strong>Largo Garibaldi</strong> o <strong>Stazione FS</strong>
                        <div style="height:24px;"></div>
                        <a class="red button" onclick="goBack();">Torna indietro</a>
                    `;
                    return;
                case "STAZIONE FS":
                    resultsContainer.innerHTML = `
                        3A S.CATERINA-MONTEFIORINO <br>
                        3A MONTEFIORINO <br>
                        3B NONANTOLANA 1010
                        <div style="height:24px;"></div>
                        <a class="red button" onclick="goBack();">Torna indietro</a>
                    `;
                    return;
                case "LARGO GARIBALDI":
                    resultsContainer.innerHTML = `
                        3A S.CATERINA-MONTEFIORINO <br>
                        3A MONTEFIORINO <br>
                        3B NONANTOLANA 1010 <br>
                        12 FINZI <br>
                        12A NAZIONI
                        <div style="height:24px;"></div>
                        <a class="red button" onclick="goBack();">Torna indietro</a>
                    `;
                    return;
            }
            return;
    }
}