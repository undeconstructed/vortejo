(function(w){let eS=document.querySelector("#ŝirmilo")
let eM=eS.querySelector(".montrilo")
eS.addEventListener("click",(e)=>{if(e.target==eS){eS.hidden=true}})
function montru(e){if(eM.firstChild){eM.removeChild(eM.firstChild)}
eM.appendChild(e)
eS.hidden=false}
w.montru=montru})(window)