const params = new URLSearchParams(window.location.search);
const container = document.getElementById('res-container');
const id = params.get('routenum');

const url = "https://setaapi.serverissimo.freeddns.org/routecodesarchive";

//Elenco percorsi
fetch(url)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        allresults = data;
        allresults.forEach(element => {
            if(id==element.linea){
                element.codes.forEach(item =>{
                    const result = document.createElement('a');
                    const hr = document.createElement('hr');
                    hr.setAttribute("class","solid");
                    const dest = routesDictionary(item);
                    result.setAttribute("class","bianco");
                    result.setAttribute("href","percorso.html?routecode="+item+"&routenum="+id);
                    if(dest==undefined){
                        if(item.includes("(")){
                            result.setAttribute("class","rosso");
                        }
                        result.innerHTML = `
                            <div class="search-result"><h3 style="margin-left: 8px;margin-right: 8px;">${item}</h3>
                        `;
                    }else{
                        if(item.includes("(")){
                            result.setAttribute("class","rosso");
                        }
                        result.innerHTML = `
                            <div class="search-result"><h3 style="margin-left: 8px;margin-right: 8px;">${dest} <br> (${item})</h3>
                        `;
                    }
                    container.appendChild(result);
                })
            }
        });
    })
    .catch(error => console.error('Errore nel caricamento dei dati:', error));

function routesDictionary(rcode){
    switch(rcode){
        //Linea 1
        case "MO1-As-153":
            return "1 ARIETE -> MARINUZZI";
        case "MO1-Di-146":
            return "1 MARINUZZI -> V.ZETA";
        case "MO1-As-150":
            return "1A V.ZETA -> MODENA EST";
        case "MO1-As-154":
            return "1 V.ZETA -> MARINUZZI";
        case "MO1-Di-147":
            return "1B MODENA EST -> ARIETE";
        case "MO1-Di-145":
            return "1B MARINUZZI -> ARIETE";
        case "MO1-As-149":
            return "1A ARIETE -> MODENA EST";
        case "MO1-As-151":
            return "1A AUTOSTAZIONE -> MODENA EST";
        case "MO1-Di-144":
            return "1A AUTOSTAZIONE -> POLO LEONARDO";
        case "MO1-As-152":
            return "1A POLO LEONARDO -> MODENA EST";
        case "MO1-Di-141":
            return "1A MARINUZZI -> POLO LEONARDO";
        case "MO1-Di-142":
            return "1A SCARLATTI -> POLO LEONARDO";
        case "MO1-Di-140":
            return "1A BONACINI -> POLO LEONARDO";
        case "MO1-As-160":
            return "1S AUTOSTAZIONE";
        //Linea 2
        case "MO2-As-220":
            return "2 SAN DAMASO";
        case "MO2-Di-269":
            return "2 SAN DAMASO -> SANT'ANNA";
        case "MO2-Di-270":
            return "2 SAN DONNINO -> SANT'ANNA";
        case "MO2-As-271":
            return "2A SAN DONNINO";
        case "MO2-Di-268":
            return "2 SAN DONNINO -> SAN DAMASO -> SANT'ANNA";
        //Linea 3
        case "MO3-As-343":
            return "3A VACIGLIO-MATTARELLA";
        case "MO3-Di-318":
            return "3 MONTEFIORINO";
        case "MO3-As-348":
            return "3 MATTARELLA";
        case "MO3-As-354":
            return "3A MONTEFIORINO -> VACIGLIO";
        case "MO3-Di-317":
            return "3 VACIGLIO -> MONTEFIORINO";
        case "MO3-Di-325 (2025)":
            return "3A VACIGLIO -> PORTORICO";
        case "MO3-Di-316 (2025)":
            return "3 MATTARELLA -> S.CATERINA";
        case "MO3-As-322 (2025)":
            return "3A PORTORICO -> VACIGLIO";
        case "MO3-As-361 (2025)":
            return "3 S.CATERINA -> MATTARELLA";
        case "MO3-Di-320 (2025)":
            return "3A MATTARELLA -> PORTORICO";
        case "MO3-As-323 (2025)":
            return "3 PORTORICO -> MATTARELLA";
        case "MO3-As-319 (2025)":
            return "3 S.CATERINA -> MATTARELLA";
        //Linea 4
        case "MO4-As-434":
            return "4 GALILEI";
        case "MO4-Di-437":
            return "4 VACIGLIO NORD";
        case "MO4-As-432":
            return "4 V.NORD -> POLO -> GALILEI";
        //Linea 5
        case "MO5-Di-535":
            return "5A LA TORRE -> D'AVIA -> TRE OLMI";
        case "MO5-Di-537":
            return "5 LA TORRE -> D'AVIA";
        case "MO5-As-540":
            return "5 TRE OLMI -> LA TORRE";
        case "MO5-As-512":
            return "5 D'AVIA -> LA TORRE";
        case "MO5-Di-542":
            return "5A LA TORRE -> TRE OLMI";
        case "MO5-As-514":
            return "5 TRE OLMI -> D'AVIA -> CENTRO 2000 -> LA TORRE";
        case "MO5-As-513":
            return "5 TRE OLMI -> D'AVIA -> LA TORRE";
        //Linea 6
        case "MO6-Di-615":
            return "6 CHINNICI";
        case "MO6-As-614":
            return "6 AUTOSTAZIONE";
        case "MO6-As-620":
            return "6A SANTI";
        case "MO6-As-622":
            return "6B VILLANOVA";
        case "MO6-Di-621":
            return "6 SANTI -> CHINNICI";
        case "MO6-Di-623":
            return "6 VILLANOVA -> CHINNICI";
        case "MO6-Di-611 (2025)":
            return "6 CHINNICI (per PANNI)";
        case "MO6-As-610 (2025)":
            return "6 AUTOSTAZIONE (per PANNI)";
        //Linea 7
        case "MO7-As-703":
            return "7 GRAMSCI";
        case "MO7-Di-702":
            return "7 GOTTARDI";
        case "MO7-As-714":
            return "7/ STAZIONE FS";
        case "MO7-Di-706":
            return "7 STAZIONE FS -> GOTTARDI (Sera)";
        case "MO7-Di-715":
            return "7 STAZIONE FS -> GOTTARDI (Mattina)";
        case "MO7-As-705":
            return "7/ AUTOSTAZIONE";
        //Linea 7A
        case "MO7A-As-753":
            return "7A GRAMSCI";
        case "MO7A-Di-752":
            return "7A GOTTARDI";
        case "MO7A-As-728":
            return "7A/ STAZIONE FS";
        case "MO7A-Di-754":
            return "7A STAZIONE FS -> GOTTARDI";
        //Linea 8
        case "MO8-As-854":
            return "8 GAZZOTTI (per ARTIGIANATO)";
        case "MO8-Di-855":
            return "8 PANNI (per ARTIGIANATO)";
        case "MO8-Di-853":
            return "8 PANNI";
        case "MO8-As-820":
            return "8 GARIBALDI -> GAZZOTTI";
        case "MO8-As-817 (2025)":
            return "8 GAZZOTTI";
        //Linea 9
        case "MO9-As-9951":
            return "9 M.NUOVA -> M.VECCHIA -> GOTTARDI";
        case "MO9-As-9952":
            return "9 CITTANOVA -> GOTTARDI (Festivo)";
        case "MO9-Di-960":
            return "9C GOTTARDI -> M.NUOVA -> RUBIERA";
        case "MO9-Di-9964":
            return "9A GOTTARDI -> M.VECCHIA -> M.NUOVA";
        case "MO9-As-963":
            return "9 RUBIERA -> M.VECCHIA -> GOTTARDI";
        case "MO9-As-9949":
            return "9 M.NUOVA -> GOTTARDI";
        case "MO9-Di-9981":
            return "9 CITTANOVA";
        case "MO9-Di-960":
            return "9C RUBIERA";
        case "MO9-As-9955":
            return "9 RUBIERA -> M.NUOVA -> M.VECCHIA -> GOTTARDI";
        case "MO9-Di-9953":
            return "9A MARZAGLIA NUOVA";
        //NUOVE
        case "MO9-Di-9954":
            return "9C GOTTARDI -> M.VECCHIA -> RUBIERA";
        case "MO9-Di-985":
            return "9C AUTOSTAZIONE -> RUBIERA";
        case "MO9-As-9950":
            return "9 RUBIERA -> M.NUOVA -> GOTTARDI";
        case "MO9-As-956":
            return "9 CITTANOVA -> GOTTARDI (Non festivo)";
        case "MO9-Di-966":
            return "9A STAZIONE FS -> M.VECCHIA -> M.NUOVA";
        case "MO9-Di-912":
            return "9A STAZIONE FS -> M.NUOVA";
        case "MO9-As-9691":
            return "9 M.NUOVA -> M.VECCHIA -> GOTTARDI";
        case "MO9-As-969":
            return "9A GOTTARDI -> M.VECCHIA -> M.NUOVA";
        case "MO9-As-9955":
            return "9 RUBIERA -> M.NUOVA -> M.VECCHIA -> GOTTARDI";
        case "MO9-As-986":
            return "9/ RUBIERA -> AUTOSTAZIONE";
        //Linea 10
        case "MO10-As-1034":
            return "10 ALBARETO -> COGNENTO";
        case "MO10-Di-1030":
            return "10A LA ROCCA";
        case "MO10-Di-1029":
            return "10 ALBARETO";
        case "MO10-As-1032":
            return "10 LA ROCCA -> COGNENTO (Festivo)";
        case "MO10-Di-1090":
            return "10A ALBARETO -> M.NUOVA";
        case "MO10-As-1058":
            return "10 LA ROCCA -> COGNENTO";
        case "MO10-As-1039":
            return "10A LA ROCCA -> M.NUOVA";
        case "MO10-Di-1045":
            return "10/ COGNENTO -> AUTOSTAZIONE";
        //Linea 11
        case "MO11-Di-1138":
            return "11 SANT'ANNA";
        case "MO11-As-1137":
            return "11 ZODIACO";
        //Linea 12
        case "MO12-As-1279":
            return "12S GARIBALDI";
        case "MO12-As-1276 (2025)":
            return "12 S.CATERINA";
        case "MO12-Di-1277 (2025)":
            return "12 POLO LEONARDO";
        case "MO12-As-1272 (2025)":
            return "12 GARIBALDI -> S.CATERINA";
        //Linea 13
        case "MO13-As-1330":
            return "13F SANT'ANNA";
        case "MO13-Di-1333":
            return "13F OSPEDALE BAGGIOVARA";
        case "MO13-As-1332":
            return "13F SANT'ANNA incl. CIMITERO";
        case "MO13-As-1334":
            return "13A CARCERE";
        case "MO13-Di-1337":
            return "13F CARCERE -> OSPEDALE BAGGIOVARA";
        case "MO13-As-1323":
            return "13 SANT'ANNA";
        case "MO13-Di-1321":
            return "13 OSPEDALE BAGGIOVARA";
        case "MO13-As-1324":
            return "13A CARCERE";
        case "MO13-Di-1320":
            return "13 CARCERE -> OSPEDALE BAGGIOVARA";
        //Linea 14
        case "MO14-Di-1434":
            return "14A NAZIONI";
        case "MO14-As-1437":
            return "14 NAZIONI -> NONANTOLANA";
        case "MO14-As-1435":
            return "14 FINZI -> NONANTOLANA";
        case "MO14-Di-1432":
            return "14 FINZI";
        case "MO14-As-1433":
            return "14 PORTORICO";
        //Linea 15
        case "MO15-Di-1501":
            return "15 VILLANOVA";
        case "MO15-As-1502":
            return "15 VILLANOVA -> AUTOSTAZIONE";
        case "MO15-Di-1503":
            return "15/ SANTI";
        case "MO15-As-1504":
            return "15 SANTI -> AUTOSTAZIONE";
        case "MO15-As-1505":
            return "15 VILLANOVA -> SAN CATALDO";
        //Linea 81
        case "MO81-As-2213":
            return "81 TETRA PAK";
        case "MO81-As-2207":
            return "81 SANT'ANNA";
    }
}