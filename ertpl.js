/*
The function below is used to fall back to the second (not for importance) server if the first is not available
Swaps both links and images sources
*/
function changeUrlToFallback(aid,imgid,path) {
    document.getElementById(aid).href = "http://serverissimo.freeddns.org:30081/apps/files_sharing/publicpreview/ffdqobqRg2ezKXt?file=" + path + "&x=1920&y=1080&a=true";
    document.getElementById(imgid).src = "http://serverissimo.freeddns.org:30081/apps/files_sharing/publicpreview/ffdqobqRg2ezKXt?file=" + path + "&x=1920&y=1080&a=true";
}