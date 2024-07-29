document.getElementById('customization-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;

    let emailText = email;
    if (email === "") {
        emailText = "Sin Correo";
    }

    const message = `*Nombre:* ${name}\n*Correo:* ${emailText}\n*Teléfono:* ${phone}\n*Tipo de Página:* ${type}\n*Descripción:* ${description}`;
    const whatsappUrl = `https://wa.me/5219984907794?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
});

let slideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide img');
const totalSlides = slides.length;

function updateSlides() {
    slides.forEach((slide, index) => {
        slide.classList.remove('active', 'adjacent');
        if (index === slideIndex) {
            slide.classList.add('active');
        } else if (index === (slideIndex + 1) % totalSlides || index === (slideIndex - 1 + totalSlides) % totalSlides) {
            slide.classList.add('adjacent');
        }
    });
}

function showSlide(index) {
    const offset = -index * 100;
    document.querySelector('.carousel-slide').style.transform = `translateX(${offset}%)`;
    updateSlides();
}

function nextSlide() {
    slideIndex = (slideIndex + 1) % totalSlides;
    showSlide(slideIndex);
}

function prevSlide() {
    slideIndex = (slideIndex - 1 + totalSlides) % totalSlides;
    showSlide(slideIndex);
}

document.querySelector('.next-button').addEventListener('click', nextSlide);
document.querySelector('.prev-button').addEventListener('click', prevSlide);

setInterval(nextSlide, 3000);
showSlide(slideIndex);

// Ventana
const overlay = document.getElementById('overlay');
const previewFrame = document.getElementById('preview-frame');
const previewTitle = document.getElementById('preview-title');
const closePreviewButton = document.getElementById('close-preview-button');

const pics = document.querySelectorAll('.image-container img');

pics.forEach((pic) => {
  pic.addEventListener('click', () => {
    const imgId = pic.id;
    const previewHtml = `${imgId}.html`;
    previewFrame.src = previewHtml;
    previewTitle.textContent = `Vista previa de ${pic.alt}`;
    overlay.classList.remove('hidden');
  });
});

closePreviewButton.addEventListener('click', () => {
  overlay.classList.add('hidden');
  previewFrame.src = '';
});
