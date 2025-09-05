const API_URL = "https://youtubeapi-g4br6b7oyq-uc.a.run.app";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const clearInputIcon = document.getElementById("clearInput");
const pasteIcon = document.getElementById("pasteIcon");
const resultsDiv = document.getElementById("results");
const modalOverlay = document.getElementById("modalOverlay");

const downloadOptions = document.getElementById("downloadOptions");
const videoThumbnail = document.getElementById("videoThumbnail");
const videoTitle = document.getElementById("videoTitle");
const tabAudio = document.getElementById("tabAudio");
const tabVideo = document.getElementById("tabVideo");
const audioContent = document.getElementById("audioContent");
const videoContent = document.getElementById("videoContent");
const videoQualitySelect = document.getElementById("videoQuality");
const cancelDownloadBtn = document.getElementById("cancelDownload");
const startDownloadBtn = document.getElementById("startDownload");

let currentVideoData = null;
let selectedFormat = "mp3";

function toggleClearButton() {
  clearInputIcon.style.display = searchInput.value.trim() ? "block" : "none";
}
searchInput.addEventListener("input", () => {
  toggleClearButton();
  updateSearchBtn();
  if(resultsDiv.childElementCount > 0) resultsDiv.innerHTML = "";
});
toggleClearButton();

document.body.onselectstart = () => document.activeElement === searchInput;
document.body.oncontextmenu = e => e.preventDefault();
window.addEventListener("wheel", e => {if(e.ctrlKey) e.preventDefault()}, {passive:false});

function showAlert(title, icon, options = {}) {
  return Swal.fire(Object.assign({
    icon, title, background:"#000814", color:"#caf0f8",
    confirmButtonColor:"#00ff7f", allowOutsideClick:false,
    allowEscapeKey:false, allowEnterKey:false, showConfirmButton:true
  }, options));
}

function showProcessAlert(message = "Procesando...") {
  return Swal.fire({
    title: message,
    background: "#000814",
    color: "#caf0f8",
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    didOpen: () => Swal.showLoading(),
    showConfirmButton: false,
  });
}

pasteIcon.onclick = async () => {
  try {
    const text=await navigator.clipboard.readText();
    searchInput.value=text;
    toggleClearButton();
    updateSearchBtn();
    if(isYoutubeUrl(text)){
      Swal.fire({
        icon:"info",
        title:"Link de YouTube detectado en portapapeles",
        background:"#000814",
        color:"#caf0f8",
        timer:2000,
        showConfirmButton:false,
      });
    }
  } catch {
    showAlert("No se pudo acceder al portapapeles", "error");
  }
};

clearInputIcon.onclick = () => {
  searchInput.value = "";
  toggleClearButton();
  updateSearchBtn();
  searchInput.focus();
  resultsDiv.innerHTML = "";
};

function isYoutubeUrl(url) {
  const regex=/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/;
  return regex.test(url);
}

function updateSearchBtn() {
  const val = searchInput.value.trim();
  if(isYoutubeUrl(val)){
    searchBtn.innerHTML = '<i class="fa-solid fa-arrow-down-to-line"></i> Descargar';
  } else {
    searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Buscar';
  }
}
const searchBtn=document.getElementById("searchBtn");
updateSearchBtn();

function renderSearchResults(videos) {
  resultsDiv.innerHTML = "";
  if(!videos.length){
    resultsDiv.innerHTML = '<p>No se encontraron resultados.</p>';
    return;
  }
  videos.forEach(video=>{
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <img src="${video.image}" alt="${video.title}" />
      <h3 title="${video.title}">${video.title}</h3>
      <p><i class="fa-regular fa-eye icon-eye"></i> ${video.views.toLocaleString()}</p>
      <p><i class="fa-regular fa-clock icon-clock"></i> ${video.duration}</p>
      <p class="author">Autor: ${video.author}</p>
      <button class="btn-download" data-url="${video.url}" data-title="${video.title}" data-img="${video.image}">
        Descargar <i class="fa-solid fa-arrow-down-to-line"></i>
      </button>
    `;
    resultsDiv.appendChild(card);
    card.querySelector(".btn-download").addEventListener("click",()=>{
      openDownloadOptions({
        url:video.url,
        title:video.title,
        image:video.image,
        inputUrl:video.url,
      });
    });
  });
}

function openDownloadOptions({url,title,image,inputUrl}){
  currentVideoData={url:inputUrl,title,image};
  videoThumbnail.src=image||"https://via.placeholder.com/480x270?text=No+Image";
  videoTitle.textContent=title||"Video seleccionado";

  selectedFormat="mp3";
  tabAudio.classList.add("active");
  tabVideo.classList.remove("active");
  audioContent.style.display="block";
  videoContent.style.display="none";
  videoQualitySelect.disabled=true;
  videoQualitySelect.setAttribute("aria-disabled","true");
  tabAudio.setAttribute("aria-selected","true");
  tabVideo.setAttribute("aria-selected","false");
  tabAudio.tabIndex=0;
  tabVideo.tabIndex=-1;

  downloadOptions.style.display="flex";
  modalOverlay.style.display="block";
  downloadOptions.focus();
}

cancelDownloadBtn.onclick=()=>{
  downloadOptions.style.display="none";
  modalOverlay.style.display="none";
  currentVideoData=null;
};

tabAudio.onclick=()=>{
  if(selectedFormat!=="mp3"){
    selectedFormat="mp3";
    tabAudio.classList.add("active");
    tabVideo.classList.remove("active");
    audioContent.style.display="block";
    videoContent.style.display="none";
    videoQualitySelect.disabled=true;
    videoQualitySelect.setAttribute("aria-disabled","true");
    tabAudio.setAttribute("aria-selected","true");
    tabVideo.setAttribute("aria-selected","false");
    tabAudio.tabIndex=0;
    tabVideo.tabIndex=-1;
  }
};
tabVideo.onclick=()=>{
  if(selectedFormat!=="mp4"){
    selectedFormat="mp4";
    tabVideo.classList.add("active");
    tabAudio.classList.remove("active");
    audioContent.style.display="none";
    videoContent.style.display="block";
    videoQualitySelect.disabled=false;
    videoQualitySelect.removeAttribute("aria-disabled");
    tabVideo.setAttribute("aria-selected","true");
    tabAudio.setAttribute("aria-selected","false");
    tabVideo.tabIndex=0;
    tabAudio.tabIndex=-1;
  }
};

startDownloadBtn.onclick=async()=>{
  if(!currentVideoData){
    showAlert("No hay video seleccionado para descargar","warning");
    return;
  }
  showProcessAlert("Procesando descarga...");
  try{
    const params=new URLSearchParams({
      action:selectedFormat,
      input:currentVideoData.url,
    });
    if(selectedFormat==="mp4"){
      params.append("quality",videoQualitySelect.value);
    }
    const res=await fetch(`${API_URL}?${params.toString()}`);
    const data=await res.json();
    Swal.close();
    if(!data.ok){
      showErrorModal(data.msg||"Error al descargar");
      return;
    }
    const a=document.createElement("a");
    a.href=data.url;
    a.download=data.filename||`download.${selectedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showAlert("Descarga iniciada","success");
    cancelDownloadBtn.click();
  }catch(err){
    Swal.close();
    showErrorModal(err.message||"Error inesperado");
  }
};

function showErrorModal(message){
  Swal.fire({
    title:"Error",
    text:message,
    icon:"error",
    showCancelButton:true,
    confirmButtonText:"Copiar error",
    cancelButtonText:"Contactar WhatsApp",
    background:"#000814",
    color:"#caf0f8",
  }).then(result=>{
    if(result.isConfirmed){
      navigator.clipboard.writeText(message).then(()=>showAlert("Texto copiado al portapapeles","success"));
    } else if(result.dismiss===Swal.DismissReason.cancel){
      const phone="+5219984907794";
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent("😮‍💨 *Hola, tengo un problema:* "+message)}`,"_blank");
    }
  });
}

searchForm.onsubmit=e=>{
  e.preventDefault();
  processInput(searchInput.value.trim());
};
async function processInput(input){
  if(!input){
    showAlert("Debe ingresar texto o link","warning");
    return;
  }
  if(isYoutubeUrl(input)){
    try{
      showProcessAlert("Obteniendo información del video...");
      const params=new URLSearchParams({action:"mp3",input});
      const res=await fetch(`${API_URL}?${params.toString()}`);
      const data=await res.json();
      Swal.close();
      if(!data.ok){
        showErrorModal(data.msg||"No se pudo obtener info");
        return;
      }
      openDownloadOptions({
        url:input,
        title:data.tittle||"Video seleccionado",
        image:data.image||"https://via.placeholder.com/480x270?text=No+Image",
        inputUrl:input,
      });
    }catch(err){
      Swal.close();
      showErrorModal(err.message||"Error al obtener info");
    }
  }else if(/^https?:\/\//.test(input)){
    showAlert("Solo se aceptan links válidos de YouTube","error");
  }else{
    showProcessAlert("Buscando videos...");
    try{
      const params=new URLSearchParams({action:"search",input});
      const res=await fetch(`${API_URL}?${params.toString()}`);
      const data=await res.json();
      Swal.close();
      if(!data.ok){
        showAlert(data.msg||"Error en la búsqueda","error");
        resultsDiv.innerHTML="";
        return;
      }
      renderSearchResults(data.results);
      showAlert(`Mostrando ${data.totalResults} resultados`,"success");
    }catch{
      Swal.close();
      showAlert("Error al realizar la búsqueda","error");
    }
  }
}
