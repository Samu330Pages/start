async function download() {
      const youtubeLink = document.getElementById('youtubeLink').value;

      if (!youtubeLink) {
        Swal.fire({
          title: "Y el link?",
          text: "Por favor, ingrese un enlace de YouTube",
          icon: "question"
        });
        return;
      }

      var pattern = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
      if (!pattern.test(youtubeLink)) {
        Swal.fire({
          title: "Link de YouTube!",
          text: "Ingrese un enlace de YouTube válido",
          icon: "error"
        });
        return;
      }

      const videoId = getVideoId(youtubeLink);

      const url = `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`;
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'b08a521a05msh9fb7af06d8c364ep1fd9b3jsnbfb450b152df',
          'X-RapidAPI-Host': 'youtube-media-downloader.p.rapidapi.com'
        }
      };

      try {
        var overlay = document.createElement("div");
            overlay.classList.add("loading-overlay");

        var spinner = document.createElement("div");
            spinner.classList.add("loading-spinner");

            overlay.appendChild(spinner);
            document.body.appendChild(overlay);
        
        const response = await fetch(url, options);
        const result = await response.json();

        document.getElementById('vidName').innerText = result.title;
        document.getElementById('channelViews').innerText = `Vistas: ${result.viewCount}`;
        document.getElementById('publishTime').innerText = `Fecha de publicación: ${result.publishedTimeText}`;

const description = result.description;
const descriptionElement = document.getElementById('descr');
const maxDescriptionLength = 150;
const readMoreLink = document.createElement('a');
const readLessLink = document.createElement('a');

if (description.length > maxDescriptionLength) {
  const shortDescription = description.slice(0, maxDescriptionLength) + '...';
  descriptionElement.innerText = shortDescription;

  readMoreLink.innerText = 'Leer más';
  readMoreLink.className = 'read-more';
  readMoreLink.onclick = function() {
    descriptionElement.innerText = description;
    readMoreLink.style.display = 'none';
    readLessLink.style.display = 'inline';
  };

  readLessLink.innerText = 'Leer menos';
  readLessLink.className = 'read-less';
  readLessLink.style.display = 'none';
  readLessLink.onclick = function() {
    descriptionElement.innerText = shortDescription;
    readMoreLink.style.display = 'inline';
    readLessLink.style.display = 'none';
  };

  descriptionElement.append(readMoreLink);
  descriptionElement.append(readLessLink);
} else {
  descriptionElement.innerText = description;
}

document.getElementById('avatarImage').src = result.channel.avatar[0].url;
document.getElementById('channelName').innerText = result.channel.name;

for (let i = 0; i < result.videos.items.length; i++) {
  const video = result.videos.items[i];
  const table = document.getElementById('videoTab').querySelector('table');
  
  const row = document.createElement('tr');
  const qualityCell = document.createElement('td');
  qualityCell.innerText = `${video.quality} / ${video.width}x${video.height}`;
  const sizeCell = document.createElement('td');
  sizeCell.innerText = video.sizeText;
  const downloadCell = document.createElement('td');

  // Condición para ocultar las filas con hasAudio en false
  if (!video.hasAudio) {
    row.style.display = "none";
  }

  // Agrega el botón de descarga
  const downloadButton = document.createElement('button');
  downloadButton.innerText = 'Descargar';
          downloadButton.setAttribute('onclick', `downloadVideo('${video.url}');copyName('${result.title}');limpiarTabla()`);
  downloadButton.setAttribute('class', "download-button");
  downloadCell.appendChild(downloadButton);

  row.appendChild(qualityCell);
  row.appendChild(sizeCell);
  row.appendChild(downloadCell);

  table.appendChild(row);
}
        
// Obtén la información de audio del JSON
const audioItems = result.audios.items;
const audioTable = document.getElementById('audioTab').querySelector('table');

// Encuentra el audio con extension "m4a" y el sizeText más alto
const maxM4aAudio = audioItems
  .filter(audio => audio.extension === 'm4a')
  .reduce((prev, current) => (prev.sizeText > current.sizeText) ? prev : current, {sizeText: ''});

// Crea la primera fila especial
const specialRow = document.createElement('tr');
const specialExtensionCell = document.createElement('td');
specialExtensionCell.innerHTML = "<i class='fas fa-crown'></i> mp3 convert";
specialExtensionCell.style.color = 'rgb(0,255,0)';
specialExtensionCell.classList.add('rgb-animation');

const specialSizeCell = document.createElement('td');
specialSizeCell.innerText = maxM4aAudio.sizeText;

const specialDownloadCell = document.createElement('td');
const specialDownloadButton = document.createElement('button');
specialDownloadButton.innerText = 'No Disponible';
specialDownloadButton.setAttribute('class', "download-button");
specialDownloadCell.appendChild(specialDownloadButton);

// Agrega las celdas a la fila especial
specialRow.appendChild(specialExtensionCell);
specialRow.appendChild(specialSizeCell);
specialRow.appendChild(specialDownloadCell);

// Agrega la fila especial a la tabla de audio antes de las otras filas
audioTable.appendChild(specialRow);

// Ahora procesa el resto de los audios como antes
for (let i = 0; i < audioItems.length; i++) {
  const audio = audioItems[i];

  const row = document.createElement('tr');
  const extensionCell = document.createElement('td');
  extensionCell.innerText = audio.extension;
  const sizeCell = document.createElement('td');
  sizeCell.innerText = audio.sizeText;
  const downloadCell = document.createElement('td');

  const downloadButton = document.createElement('button');
  downloadButton.innerText = 'Descargar';
  downloadButton.setAttribute('onclick', `downloadAudio('${audio.url}');copyName('${result.title}');limpiarTabla()`);
  downloadButton.setAttribute('class', "download-button");
  downloadCell.appendChild(downloadButton);

  // Agrega las celdas a la fila
  row.appendChild(extensionCell);
  row.appendChild(sizeCell);
  row.appendChild(downloadCell);

  // Agrega la fila a la tabla de audio
  audioTable.appendChild(row);
}       

        overlay.remove();
        openPopup(result.thumbnails[result.thumbnails.length - 1].url);
      } catch (error) {
        overlay.remove();
        Swal.fire(error.message);
      }
    }
    
    function scrollToTop() {
  const popupContent = document.querySelector('.popup-content');
  const scrollDuration = 500; // Duración de la animación en milisegundos 
  const scrollStep = -popupContent.scrollTop / (scrollDuration / 15); // Cantidad de píxeles a desplazar por intervalo
  
  let scrollIntervalId;
  
  function scrollToTopAnimation() {
    if (popupContent.scrollTop !== 0) {
      // Calcula la nueva posición del scroll
      popupContent.scrollTop += scrollStep;
      // Crea un intervalo recursivo para la animación
      scrollIntervalId = setTimeout(scrollToTopAnimation, 15);
    }
  }
  
  // Inicia la animación
  scrollToTopAnimation();
}
    

function downloadVideo(videoUrl) {
  const modalContent = `
    <div class="media-modal">
      <video controls autoplay>
        <source src="${videoUrl}" type="video/mp4">
        Tu navegador no soporta videos HTML5.
      </video>
      <button onclick="closeMediaModal()">Cerrar</button>
    </div>
  `;
  closePopup()
  showMediaModal(modalContent);
}

function downloadAudio(audioUrl) {
  const modalContent = `
    <div class="media-modal">
      <audio controls autoplay>
        <source src="${audioUrl}" type="audio/mp4">
        Tu navegador no soporta audio HTML5.
      </audio>
      <button onclick="closeMediaModal()">Cerrar</button>
    </div>
  `;
  closePopup()
  showMediaModal(modalContent);
}
 
function showMediaModal(content) {
  const modal = document.createElement('div');
  modal.id = 'mediaModal';
  modal.innerHTML = content;
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.backgroundColor = '#fff';
  modal.style.padding = '20px';
  modal.style.zIndex = '1000';
  modal.style.borderRadius = '10px';
  document.body.appendChild(modal);
}
    
function closeMediaModal() {
  const modal = document.getElementById('mediaModal');
  if (modal) {
    modal.parentNode.removeChild(modal);
  }
}
    
function getVideoId(url) {
  let videoId = '';

  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1];
  }

  else if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('youtube.com/watch?v=')[1];
  }
  let ampersandPosition = videoId.indexOf('&');
  if (ampersandPosition != -1) {
    videoId = videoId.substring(0, ampersandPosition);
  }

  let questionMarkPosition = videoId.indexOf('?');
  if (questionMarkPosition != -1) {
    videoId = videoId.substring(0, questionMarkPosition);
  }

  return videoId;
}


    let activeTab = 'videoTab';

    function changeTab(tabId) {
      document.getElementById(activeTab).classList.remove('active');
      document.querySelector('[data-tab="' + activeTab + '"]').classList.remove('active');

      document.getElementById(tabId).classList.add('active');
      document.querySelector('[data-tab="' + tabId + '"]').classList.add('active');

      activeTab = tabId;
    }

    function openPopup(imageUrl) {
      document.getElementById('popup').classList.add('active');
      document.getElementById('popupImage').src = imageUrl;
    }

    function closePopup() {
      limpiarTabla()
      document.getElementById('popup').classList.remove('active');
    }
    
    
var imagenes = [
  { src: "./images/tuto1.jpg", texto: "Como primer paso debes copiar el link del video de YouTube que quieras descargar, y pegarlo en el apartado de entrada de texto: 'Pegue el enlace de YT', una vez pegado el enlace simplemente dale al botón 'Descargar'." },
  { src: "./images/tuto2.jpg", texto: "El segundo paso será decidir que descargar, si video o audio, puedes cambiar de pestaña para seleccionar entre video y audio, una vez ya decidido que descargar procede solamente a verificar en que calidad descargar, y le das al botón de descarga." },
  { src: "./images/tuto3.jpg", texto: "En el tercer paso se abrirá una pequeña ventana con el contenido que ayas seleccionado (Audio/Video), como se muestra en la imagen, se debe cliquear en los 3 puntos para poder descargar el contenido, puedes previsualizar antes de descargar." },
  { src: "./images/tuto4.jpg", texto: "Ya como último paso solamente toca descargar y la descarga comenzara inmediatamente, dependiendo tu navegador te permitirá seleccionar la ruta en donde se guardara y que nombre darle al documento." },
  { src: "./images/tuto5.jpg", texto: "Y como se muestra en la imagen tanto como en video y audio es completamente lo mismo, Disfruta." }
];
var indiceActual = 0;

function precargarImagenes() {
  for(var i = 0; i < imagenes.length; i++) {
    var img = new Image();
    img.src = imagenes[i].src;
  }
}

function abrirVentana() {
  document.getElementById('ventana').style.display = 'flex';
  mostrarImagen(indiceActual);
}

function cerrarVentana() {
  document.getElementById('ventana').style.display = 'none';
}

function mostrarImagen(indice) {
  if (indice >= 0 && indice < imagenes.length) {
    document.getElementById('imagen').src = imagenes[indice].src;
    document.getElementById('texto').textContent = imagenes[indice].texto;
    indiceActual = indice;
  }
}

function cambiarImagen(direccion) {
  var nuevoIndice = indiceActual + direccion;
  
  if (nuevoIndice < 0) {
    nuevoIndice = imagenes.length - 1;
  } else if (nuevoIndice >= imagenes.length) {
    nuevoIndice = 0;
  }
  
  mostrarImagen(nuevoIndice);
}

precargarImagenes();
    
    function limpiarTabla() {
    	const videoTable = document.getElementById('videoTab').querySelector('table');
  		while (videoTable.firstChild) {
    		videoTable.removeChild(videoTable.firstChild);
  			}
  		const audioTable = document.getElementById('audioTab').querySelector('table');
  		while (audioTable.firstChild) {
    		audioTable.removeChild(audioTable.firstChild);
  		}
    }
    function limpiarInput() {
    	document.getElementById('youtubeLink').value="";
    }
    
    function m4a() {
  const info = `<div style="display: flex; justify-content: center; align-items: center; width: 90vw; height: 80vh;">
    <div style="width: 80%; max-height: 80%; overflow-y: auto; background-color: #c4c4; color: #0056b3; padding: 20px; border-radius: 10px; text-align: left; box-sizing: border-box;">
      <h2 style="color: #004094;">¿Por qué es mejor el formato M4A y WEBM?</h2>
      <p>El formato M4A y WEBM ofrecen una serie de ventajas en comparación con el formato MP3, entre las que destacan:</p>
      <ul style="list-style-type: disc; margin-left: 20px;">
        <li><strong>Mejor calidad de sonido:</strong> Ambos formatos permiten una mejor compresión sin pérdida de calidad.</li>
        <li><strong>Compatibilidad:</strong> Son ampliamente compatibles con dispositivos modernos y plataformas de streaming.</li>
        <li><strong>Optimización de archivos:</strong> Permiten obtener tamaños de archivo más pequeños a igualdad de calidad, lo que facilita la descarga y el almacenamiento.</li>
        <li><strong>Soporte para metadatos avanzados:</strong> Permiten incluir más información sobre el archivo, como carátulas, letras de canciones, etc.</li>
      </ul>
      <p>Estas características hacen que el M4A y WEBM sean opciones superiores para la descarga y el disfrute de contenido multimedia, ofreciendo una experiencia de usuario mejorada.</p>
      <p style="margin-top: 30px; text-align: center;">
        <button onclick="closeMediaModal()" style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Entendido</button>
      </p>
    </div>
  </div>`;
  showMediaModal(info);
}
    
    function copyName(name) {
    	navigator.clipboard.writeText(name);
      	Swal.fire({
  			position: "top-end",
  			icon: "success",
  			title: "sé ha copiado el título de tu video/audio!",
  			showConfirmButton: false,
  			timer: 1500
		});
    }
    
    particlesJS('particles-js', {
      "particles": {
        "number": {
          "value": 90,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "#00CED1"
        },
        "shape": {
          "type": "triangle",
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          },
          "image": {
            "src": "img/github.svg",
            "width": 100,
            "height": 100
          }
        },
        "opacity": {
          "value": 0.5,
          "random": false,
          "anim": {
            "enable": false,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": {
          "value": 5,
          "random": true,
          "anim": {
            "enable": false,
            "speed": 40,
            "size_min": 0.1,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#ff00ff",
          "opacity": 0.4,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 6,
          "direction": "none",
          "random": false,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": {
            "enable": false,
            "rotateX": 600,
            "rotateY": 1200
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": true,
            "mode": "repulse"
          },
          "onclick": {
            "enable": true,
            "mode": "push"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 400,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 400,
            "size": 40,
            "duration": 2,
            "opacity": 8,
            "speed": 3
          },
          "repulse": {
            "distance": 200,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    });
