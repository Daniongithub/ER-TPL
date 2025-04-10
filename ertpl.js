/*
The function below is used to fall back to the second (not for importance) server if the first is not available
Swaps both links and images sources
aid = identifier for the anchor (a tag)
imgid = identifier for the image (img tag)
path = path for the image starting from the root, for example /Dani/10225.jpg
*/
function changeUrlToFallback(aid,imgid,path) {
    try {
        document.getElementById(imgid).src = "http://serverissimo.freeddns.org:30081/apps/files_sharing/publicpreview/ffdqobqRg2ezKXt?file=" + path + "&x=1920&y=1080&a=true";
    } catch {}
    try {
        document.getElementById(aid).href = "http://serverissimo.freeddns.org:30081/apps/files_sharing/publicpreview/ffdqobqRg2ezKXt?file=" + path + "&x=1920&y=1080&a=true";
    } catch {}
}
function changeUrlToFallbackNoTrue(aid,imgid,path) {
    try {
        document.getElementById(imgid).src = "http://serverissimo.freeddns.org:30081/apps/files_sharing/publicpreview/ffdqobqRg2ezKXt?file=" + path + "&x=1920&y=1080";
    } catch {}
    try {
        document.getElementById(aid).href = "http://serverissimo.freeddns.org:30081/apps/files_sharing/publicpreview/ffdqobqRg2ezKXt?file=" + path + "&x=1920&y=1080";
    } catch {}
}