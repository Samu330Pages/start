const apiBaseUrl = 'https://facebookdl-g4br6b7oyq-uc.a.run.app/?url=';
const input = document.getElementById('videoUrl');
const pasteBtn = document.getElementById('pasteBtn');
const previewDiv = document.getElementById('previewContainer');
const thumbnailImg = document.getElementById('thumbnail');
const videoLinksDiv = document.getElementById('videoLinksContainer');
const downloadBtn = document.getElementById('downloadBtn');
const btnLoader = document.getElementById('btnLoader');

// Validar link Facebook
function isFacebookUrl(url) {
  try {
    if (!url) return false;
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return (host.includes('facebook.com') || host.includes('fb.watch'));
  } catch {
    return false;
  }
}

// Random ID 4 chars alfanum
function generateRandomID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for(let i=0; i<4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Pegar del portapapeles
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    input.value = text.trim();
  } catch {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'No se pudo acceder al portapapeles. Por favor pega manualmente el enlace.',
    });
  }
}

// Descargar archivo
function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Mostrar loader en botón
function showLoadingBtn() {
  downloadBtn.disabled = true;
  downloadBtn.classList.add('loading');
}
function hideLoadingBtn() {
  downloadBtn.disabled = false;
  downloadBtn.classList.remove('loading');
}

// Función principal API y mostrar UI
async function processVideoUrl(url) {
  if (!isFacebookUrl(url)) {
    Swal.fire({
      icon: 'warning',
      title: 'URL inválida',
      text: 'Por favor ingresa un enlace válido de Facebook.',
    });
    return;
  }

  previewDiv.style.display = 'none';
  videoLinksDiv.innerHTML = '';
  showLoadingBtn();

  try {
    const response = await fetch(apiBaseUrl + encodeURIComponent(url));
    if (!response.ok) throw new Error('Error en la respuesta del servidor');
    const data = await response.json();

    if (!data || !data.videoLinks || data.videoLinks.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo procesar el video',
        text: 'Revisa que el enlace sea correcto y que el video esté disponible.',
      });
      hideLoadingBtn();
      return;
    }

    if (data.thumbnail) {
      thumbnailImg.src = data.thumbnail;
      previewDiv.style.display = 'block';
    } else {
      previewDiv.style.display = 'none';
    }

    videoLinksDiv.innerHTML = '';
    data.videoLinks.forEach(video => {
      const btn = document.createElement('button');
      btn.classList.add('download-btn');
      btn.type = 'button';
      btn.innerHTML = `<i class="fas fa-cloud-download-alt"></i> ${video.quality}`;
      btn.title = `Descargar video en calidad ${video.quality}`;
      btn.addEventListener('click', () => {
        const id = generateRandomID();
        const filename = `fb-dl-${id}-samu330.com.mp4`;
        downloadFile(video.url, filename);
      });
      videoLinksDiv.appendChild(btn);
    });

    hideLoadingBtn();

  } catch {
    hideLoadingBtn();
    Swal.fire({
      icon: 'error',
      title: 'Error de conexión',
      text: 'No se pudo procesar el video. Intenta más tarde.',
    });
  }
}

// Desactivar clic derecho, selección y zoom
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());
window.addEventListener('wheel', e => {
  if(e.ctrlKey) e.preventDefault();
}, { passive: false });
window.addEventListener('keydown', e => {
  if((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) {
    e.preventDefault();
  }
});

// Listeners
pasteBtn.addEventListener('click', pasteFromClipboard);
downloadBtn.addEventListener('click', () => {
  const url = input.value.trim();
  if (!url) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo vacío',
      text: 'Por favor ingresa o pega un link de Facebook primero.',
    });
    return;
  }
  processVideoUrl(url);
});

// Detectar link fb en portapapeles al cargar
async function checkClipboardForFacebookLink() {
  try {
    const clipText = await navigator.clipboard.readText();
    if (isFacebookUrl(clipText.trim())) {
      Swal.fire({
        icon: 'info',
        title: 'Enlace detectado',
        text: 'Se detectó un link de Facebook en tu portapapeles. ¿Quieres descargar el video?',
        showCancelButton: true,
        confirmButtonText: 'Sí, quiero',
        cancelButtonText: 'No, gracias',
        timer: 10000,
        timerProgressBar: true,
        allowOutsideClick: false,
      }).then(result => {
        if (result.isConfirmed) {
          input.value = clipText.trim();
          processVideoUrl(clipText.trim());
        }
      });
    }
  } catch {}
}

window.addEventListener('load', () => {
  checkClipboardForFacebookLink();
});
