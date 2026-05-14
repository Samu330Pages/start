// ==========================================
// 1. VARIABLES GLOBALES Y CONFIGURACIÓN
// ==========================================
let messageHistory = [];
let currentEditingId = null;
let currentEditingDateId = null;
let msgToDeleteId = null;
let isDarkMode = false;
let customPhoto = null;
let cropper;

const emojiConvertor = new EmojiConvertor();
emojiConvertor.img_set = 'google';
emojiConvertor.img_sets.google.path = 'https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-google-64/';
emojiConvertor.allow_native = false;

const fileInput = document.getElementById('file-input');
const modal = document.getElementById('cropper-modal');
const imageToCrop = document.getElementById('image-to-crop');

// ==========================================
// 2. INTERFAZ
// ==========================================
function toggleConfig() {
    const panel = document.getElementById("config-panel");
    panel.classList.toggle("open");
    const guide = document.getElementById("welcome-guide");
    if (guide) guide.style.display = "none";
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    const body = document.body;
    const themeIcon = document.getElementById("theme-icon");
    const avatarImg = document.getElementById("avatar-img");

    const iconBack = document.getElementById("icon-back");
    const iconVideo = document.getElementById("icon-video");
    const iconCall = document.getElementById("icon-call");

    if (isDarkMode) {
        body.classList.replace("light-theme", "dark-theme");
        themeIcon.className = "fa-solid fa-sun";
        themeIcon.style.color = "#ffbd00";
        if (!customPhoto) avatarImg.src = "images/avatar_contact_n.webp";
        iconBack.src = "images/ic_arrow_back_white.webp";
        iconVideo.src = "images/ic_videocam_white.webp";
        iconCall.src = "images/ic_call_white.webp";
    } else {
        body.classList.replace("dark-theme", "light-theme");
        themeIcon.className = "fa-solid fa-moon";
        themeIcon.style.color = "#54656f";
        if (!customPhoto) avatarImg.src = "images/avatar_contact.webp";
        iconBack.src = "images/ic_arrow_back.webp";
        iconVideo.src = "images/ic_videocam.webp";
        iconCall.src = "images/ic_call.webp";
    }
}

// ==========================================
// 3. PERFIL Y ESTADO
// ==========================================
function updateStatusLayout() {
    const statusSelect = document.getElementById("set-status");
    const lastSeenContainer = document.getElementById("last-seen-container");
    if (statusSelect.value === "última vez hoy a las") {
        lastSeenContainer.style.display = "block";
    } else {
        lastSeenContainer.style.display = "none";
    }
    updateProfile();
}

function updateProfile() {
    const nameInput = document.getElementById("set-name").value;
    const statusSelect = document.getElementById("set-status").value;
    const lastSeenInput = document.getElementById("set-last-seen").value;
    const nameDisplay = document.getElementById("name");
    const statusDisplay = document.querySelector(".status");

    if (nameInput) nameDisplay.innerText = nameInput;

    if (statusSelect === "última vez hoy a las") {
        if (lastSeenInput) {
            const selectedDate = new Date(lastSeenInput);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            const dateToCompare = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

            const formattedTime = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            let dateText = "";

            if (dateToCompare.getTime() === today.getTime()) dateText = "hoy";
            else if (dateToCompare.getTime() === yesterday.getTime()) dateText = "ayer";
            else dateText = `el ${selectedDate.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' })}`;

            statusDisplay.innerText = `últ. vez ${dateText} a las ${formattedTime}`;
        } else {
            statusDisplay.innerText = "última vez recientemente";
        }
    } else {
        statusDisplay.innerText = statusSelect;
    }
}

// ==========================================
// 4. LÓGICA DE MENSAJES
// ==========================================
function formatWhatsAppText(text, debeCortar = false) {
    if (!text) return "";

    let finalText = text;
    const limiteCaracteres = 600;

    if (debeCortar && text.length > limiteCaracteres) {
        finalText = text.substring(0, limiteCaracteres) + '... <span class="read-more">Leer más</span>';
    }

    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]|\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]|\b[A-Z0-9.-]+\.(?:com|net|org|edu|gov|mil|biz|info|mobi|name|aero|jobs|museum|mx|es|io|me|tv|app)\b([-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])?)/ig;
    const phoneRegex = /(\+?\d{1,4}?[\s-]?\(?\d{1,3}?\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9})/g;

    let formatted = finalText
        .replace(/\*(.*?)\*/g, '<b>$1</b>')
        .replace(/_(.*?)_/g, '<i>$1</i>')
        .replace(/~(.*?)~/g, '<strike>$1</strike>')
        .replace(/```(.*?)```/gs, '<code>$1</code>')
        .replace(/\n/g, '<br>');

    formatted = formatted.replace(urlPattern, function (url) {
        let href = url;
        if (!url.match(/^(https?|ftp|file):\/\//i) && !url.match(/^www\./i)) {
            href = 'https://' + url;
        }
        return `<span class="chat-link">${url}</span>`;
    });

    formatted = formatted.replace(phoneRegex, function (match) {
        if (match.replace(/\D/g, '').length >= 7) {
            return `<span class="chat-link">${match}</span>`;
        }
        return match;
    });

    return emojiConvertor.replace_unified(formatted);
}

function updatePreview() {
    const rawText = document.getElementById("set-msg").value;
    const side = document.getElementById("set-side").value;
    const tickStatus = document.getElementById("set-tick").value;
    const previewBubble = document.getElementById("msg-preview-bubble");
    const previewText = document.getElementById("preview-text-content");
    const previewTick = document.getElementById("preview-tick-icon");

    previewText.innerHTML = formatWhatsAppText(rawText, true) || "&nbsp;";

    if (side === "RIGHT") {
        previewBubble.className = isDarkMode ? "message sent-first dark" : "message sent-first";
        previewBubble.style.alignSelf = "flex-end";
        previewBubble.style.background = isDarkMode ? "#005c4b" : "#d9fdd3";
        let tickColor = tickStatus === "read" ? "#53bdeb" : "#8696a0";
        if (tickStatus === "sent") {
            previewTick.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15"><path fill="${tickColor}" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512z"/></svg>`;
        } else {
            previewTick.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15"><path fill="${tickColor}" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/></svg>`;
        }
    } else {
        previewBubble.className = isDarkMode ? "message received-first dark" : "message received-first";
        previewBubble.style.alignSelf = "flex-start";
        previewBubble.style.background = isDarkMode ? "#202c33" : "#fff";
        previewTick.innerHTML = "";
    }
}

function processNewMessage() {
    const rawText = document.getElementById("set-msg").value;
    const side = document.getElementById("set-side").value;
    const tickStatus = document.getElementById("set-tick").value;
    const replyToId = document.getElementById("reply-to-msg").value;
    const systemDateSelect = document.getElementById("set-system-date");
    const customDateInput = document.getElementById("custom-date-input");
    const setMsgTime = document.getElementById("set-msg-time");

    if (!rawText.trim()) return;

    const chatContainer = document.getElementById("chat");
    const lastMessage = messageHistory[messageHistory.length - 1];
    const isSameSide = lastMessage && lastMessage.side === side;

    if (systemDateSelect && systemDateSelect.value !== "") {
        let dateText = "";
        if (systemDateSelect.value === "CUSTOM" && customDateInput && customDateInput.value) {
            const fechaObj = new Date(customDateInput.value + 'T00:00:00');
            dateText = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        } else {
            dateText = systemDateSelect.value.toLowerCase();
        }

        if (dateText) {
            dateText = dateText.charAt(0).toUpperCase() + dateText.slice(1).toLowerCase();
            const dateId = "date-" + Date.now();
            chatContainer.insertAdjacentHTML('beforeend', `<div id="${dateId}" class="chat-date" onclick="openDateModal('${dateId}')">${dateText}</div>`);
        }
    }

    let finalTime = setMsgTime && setMsgTime.value ? setMsgTime.value : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    let replyHTML = "";
    if (replyToId !== "none") {
        const repliedMsg = messageHistory.find(m => m.id === replyToId);
        if (repliedMsg) {
            const author = repliedMsg.side === 'RIGHT' ? 'Tú' : document.getElementById("name").innerText;
            replyHTML = `
    <div class="reply-box">
        <b class="reply-author">${author}</b>
        <p>${formatWhatsAppText(repliedMsg.text, true)}</p>
    </div>`;
        }
    }

    let tickSVG = "";
    if (side === "RIGHT") {
        let tickColor = tickStatus === "read" ? "#53bdeb" : "#8696a0";
        const path = (tickStatus === "sent") ?
            "M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512z" :
            "M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z";
        tickSVG = `<span class="tick"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15"><path fill="${tickColor}" d="${path}"/></svg></span>`;
    }

    const msgId = "msg-" + Date.now();
    const formattedText = formatWhatsAppText(rawText, true);
    const bubbleClass = side === "RIGHT" ? (isSameSide ? "sent-after" : "sent-first") : (isSameSide ? "received-after" : "received-first");

    const wrapperHTML = `
        <div class="message-wrapper ${side === 'RIGHT' ? 'sent-first' : ''}" id="wrapper-${msgId}">
            <div id="${msgId}" class="message ${bubbleClass}">
                ${replyHTML}
                <span class="text-content">${formattedText}</span>
                <div class="metadata">
                    <span class="time">${finalTime}</span>
                    ${tickSVG}
                </div>
            </div>
            <div class="message-actions">
                <img src="images/ic_delete_red.webp" class="action-icon" onclick="deleteMessage('${msgId}')" title="Eliminar">
                <i class="fa-solid fa-pencil action-icon" style="color: ${isDarkMode ? '#aebac1' : '#54656f'}" onclick="openEditModal('${msgId}')" title="Editar"></i>
            </div>
        </div>
    `;

    chatContainer.insertAdjacentHTML('beforeend', wrapperHTML);
    messageHistory.push({ id: msgId, side: side, text: rawText, time: finalTime, ticks: tickStatus });
    updateReplySelector();
    document.getElementById("set-msg").value = "";
    updatePreview();
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ==========================================
// 5. MODALES Y EDICIÓN
// ==========================================
function closeAllModals() {
    document.getElementById("modal-overlay").style.display = "none";
    document.getElementById("delete-modal").style.display = "none";
    document.getElementById("edit-modal").style.display = "none";
    const dateModal = document.getElementById("date-modal");
    if (dateModal) dateModal.style.display = "none";
}

function deleteMessage(id) {
    msgToDeleteId = id;
    document.getElementById("modal-overlay").style.display = "block";
    document.getElementById("delete-modal").style.display = "block";
}

document.getElementById("confirm-delete-btn").onclick = function () {
    if (msgToDeleteId) {
        const wrapper = document.getElementById("wrapper-" + msgToDeleteId);
        if (wrapper) wrapper.remove();
        messageHistory = messageHistory.filter(m => m.id !== msgToDeleteId);
        updateReplySelector();
        closeAllModals();
        msgToDeleteId = null;
    }
};

function openEditModal(id) {
    const msg = messageHistory.find(m => m.id === id);
    if (!msg) return;
    currentEditingId = id;
    document.getElementById("edit-text").value = msg.text;
    document.getElementById("edit-time").value = msg.time;
    const ticksCont = document.getElementById("edit-ticks-container");
    if (msg.side === "RIGHT") {
        ticksCont.style.display = "block";
        document.getElementById("edit-tick").value = msg.ticks;
    } else {
        ticksCont.style.display = "none";
    }
    document.getElementById("modal-overlay").style.display = "block";
    document.getElementById("edit-modal").style.display = "block";
}

function saveMessageEdit() {
    const msgIndex = messageHistory.findIndex(m => m.id === currentEditingId);
    if (msgIndex === -1) return;

    const newText = document.getElementById("edit-text").value;
    const newTime = document.getElementById("edit-time").value;
    const newTick = document.getElementById("edit-tick").value;
    const editDateSelect = document.getElementById("edit-system-date").value;
    const editCustomDate = document.getElementById("edit-custom-date").value;

    messageHistory[msgIndex].text = newText;
    messageHistory[msgIndex].time = newTime;
    messageHistory[msgIndex].ticks = newTick;

    const msgElement = document.getElementById(currentEditingId);
    msgElement.querySelector(".text-content").innerHTML = formatWhatsAppText(newText);
    msgElement.querySelector(".time").innerText = newTime;

    if (editDateSelect !== "") {
        let dateText = "";
        if (editDateSelect === "CUSTOM" && editCustomDate) {
            const fechaObj = new Date(editCustomDate + 'T00:00:00');
            dateText = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        } else {
            dateText = editDateSelect.toLowerCase();
        }
        if (dateText) {
            dateText = dateText.charAt(0).toUpperCase() + dateText.slice(1).toLowerCase();
            const wrapper = document.getElementById("wrapper-" + currentEditingId);
            const prev = wrapper.previousElementSibling;

            if (prev && prev.classList.contains("chat-date")) {
                prev.innerText = dateText;
            } else {
                const newDateId = "date-" + Date.now();
                wrapper.insertAdjacentHTML('beforebegin', `<div id="${newDateId}" class="chat-date" onclick="openDateModal('${newDateId}')">${dateText}</div>`);
            }
        }
    }

    if (messageHistory[msgIndex].side === "RIGHT") {
        const tickColor = newTick === "read" ? "#53bdeb" : "#8696a0";
        const path = (newTick === "sent") ?
            "M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512z" :
            "M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z";
        const svgPath = msgElement.querySelector(".tick svg path");
        if (svgPath) { svgPath.setAttribute("fill", tickColor); svgPath.setAttribute("d", path); }
    }
    closeAllModals();
}

// ==========================================
// 6. FECHAS (BURBUJAS DE SISTEMA)
// ==========================================
function openDateModal(id) {
    currentEditingDateId = id;
    const modal = document.getElementById("date-modal");
    const overlay = document.getElementById("modal-overlay");

    if (modal && overlay) {
        overlay.style.display = "block";
        modal.style.display = "block";
    }
}

function saveSystemDate() {
    if (!currentEditingDateId) return;
    const select = document.getElementById("edit-date-select").value;
    const custom = document.getElementById("edit-date-custom").value;
    let newText = "";

    if (select === "CUSTOM" && custom) {
        const fechaObj = new Date(custom + 'T00:00:00');
        newText = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } else {
        newText = select.toLowerCase();
    }

    if (newText) {
        newText = newText.charAt(0).toUpperCase() + newText.slice(1).toLowerCase();
        document.getElementById(currentEditingDateId).innerText = newText;
    }
    closeAllModals();
}

function deleteSystemDate() {
    if (currentEditingDateId) {
        const dateElement = document.getElementById(currentEditingDateId);
        if (dateElement) dateElement.remove();
        closeAllModals();
        currentEditingDateId = null;
    }
}

// ==========================================
// 7. OTROS XD
// ==========================================
function updateReplySelector() {
    const select = document.getElementById("reply-to-msg");
    select.innerHTML = '<option value="none">-- Ninguno --</option>';
    messageHistory.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.innerText = (m.side === 'RIGHT' ? 'Tú: ' : 'Contacto: ') + m.text.substring(0, 30);
        select.appendChild(opt);
    });
}

fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 10485760) {
            alert("La imagen es demasiado grande. El límite es 10MB.");
            this.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
            imageToCrop.src = event.target.result;
            modal.style.display = 'flex';
            if (cropper) cropper.destroy();
            cropper = new Cropper(imageToCrop, { aspectRatio: 1, viewMode: 1, autoCropArea: 1 });
        };
        reader.readAsDataURL(file);
    }
});

function applyCrop() {
    const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
    customPhoto = canvas.toDataURL('image/webp');
    document.getElementById("avatar-img").src = customPhoto;
    cancelCrop();
}

function cancelCrop() {
    modal.style.display = 'none';
    fileInput.value = "";
    if (cropper) cropper.destroy();
}

function descargarCaptura() {
    const btn = document.querySelector('.btn-download');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';

    const areaCaptura = document.querySelector('.screen-container');
    const guia = document.getElementById("welcome-guide");
    if (guia) guia.style.display = "none";

    html2canvas(areaCaptura, {
        useCORS: true,
        scale: 3,
        backgroundColor: isDarkMode ? "#0b141a" : "#efeae2",
    }).then(canvas => {
        const link = document.createElement('a');
        const fecha = new Date().toLocaleDateString().replace(/\//g, '-');
        link.download = `Captura-WhatsApp-${fecha}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
    });
}

// ==========================================
// 8. EVENT LISTENERS
// ==========================================
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);

document.addEventListener('dragstart', function(e) {
    if (e.target.nodeName === 'IMG') {
        e.preventDefault();
    }
}, false);

document.getElementById("edit-date-select").addEventListener("change", function () {
    const custom = document.getElementById("edit-date-custom");
    if (custom) custom.style.display = (this.value === "CUSTOM") ? "block" : "none";
});

document.getElementById("edit-system-date").addEventListener("change", function () {
    const custom = document.getElementById("edit-custom-date");
    if (custom) custom.style.display = (this.value === "CUSTOM") ? "block" : "none";
});

document.getElementById("set-system-date").addEventListener("change", function () {
    const customInput = document.getElementById("custom-date-input");
    customInput.style.display = (this.value === "CUSTOM") ? "block" : "none";
});

document.getElementById("set-msg").addEventListener("input", updatePreview);
document.getElementById("set-side").addEventListener("change", updatePreview);
document.getElementById("set-tick").addEventListener("change", updatePreview);