document.getElementById('customization-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;

    let emailText = email;
    if (email === "") {
        emailText = "_Sin Correo_";
    }

    const message = `*👤 Nombre:* ${name}\n*📩 Correo:* ${emailText}\n*📱 Teléfono:* ${phone}\n*🗂 Tipo de Página:* ${type}\n*📝 Descripción:* ${description}`;
    const whatsappUrl = `https://wa.me/5219984907794?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
});

// Ventana
const overlay = document.getElementById('overlay');
const previewFrame = document.getElementById('preview-frame');
const previewTitle = document.getElementById('preview-title');
const closePreviewButton = document.getElementById('close-preview-button');

const pics = document.querySelectorAll('.image-container img');

pics.forEach((pic) => {
  pic.addEventListener('click', () => {
    const imgId = pic.id;
    const previewHtml = `types/${imgId}.html`;
    previewFrame.src = previewHtml;
    previewTitle.textContent = `Vista previa: ${pic.alt}`;
    overlay.classList.remove('hidden');
  });
});

closePreviewButton.addEventListener('click', () => {
  overlay.classList.add('hidden');
  previewFrame.src = '';
});
