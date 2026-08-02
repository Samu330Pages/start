import { youtubePlatform } from './services/yt/yt.js';
import { instagramPlatform } from './services/instagram/instagram.js';
import { facebookPlatform } from './services/facebook/facebook.js';
import { tiktokPlatform } from './services/tiktok/tiktok.js';

document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

window.addEventListener('DOMContentLoaded', () => {
    const searchView = document.getElementById('searchView');
    const actionForm = document.getElementById('actionForm');
    const userInput = document.getElementById('userInput');
    const pasteBtn = document.getElementById('pasteBtn');
    const clearBtn = document.getElementById('clearBtn');
    const actionBtn = document.getElementById('actionBtn');
    const actionIcon = document.getElementById('actionIcon');
    const actionText = document.getElementById('actionText');
    const resultsView = document.getElementById('resultsView');
    const backBtn = document.getElementById('backBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsContainer = document.getElementById('resultsContainer');
    const queryLabel = document.getElementById('queryLabel');
    const platformDetailsView = document.getElementById('platformDetailsView');

    const themeStylesheet = document.getElementById('theme-stylesheet');
    const modeToggleBtn = document.getElementById('modeToggleBtn');
    const modeIcon = document.getElementById('modeIcon');
    const contrastStandardBtn = document.getElementById('contrastStandardBtn');
    const contrastMediumBtn = document.getElementById('contrastMediumBtn');
    const contrastHighBtn = document.getElementById('contrastHighBtn');
    const themeMenuBtn = document.getElementById('themeMenuBtn');
    const themeMenu = document.getElementById('themeMenu');
    const dialog = document.getElementById('warningDialog');
    const closeDialogBtn = document.getElementById('closeWarningBtn');
    const inputPrefix = document.getElementById('inputPrefix');

    let currentPlatform = 'youtube';

    const generalUrlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i;

    const sharedDom = {
        searchView,
        resultsView,
        platformDetailsView,
        userInput,
        warningDialog: dialog
    };

    youtubePlatform.init({
        ...sharedDom,
        queryLabel,
        loadingIndicator,
        resultsContainer
    });

    instagramPlatform.init({
        ...sharedDom,
        queryLabel,
        loadingIndicator,
        resultsContainer
    });

    facebookPlatform.init({
        ...sharedDom,
        queryLabel,
        loadingIndicator,
        resultsContainer
    });

    tiktokPlatform.init({
        ...sharedDom,
        queryLabel,
        loadingIndicator,
        resultsContainer
    });

    function updatePlatformInputMode() {
        let value = userInput.value.trim();

        if (youtubePlatform.regex.test(value)) {
            userInput.label = "Enlace de YouTube detectado";
            inputPrefix.innerHTML = `<i class="fa-brands fa-youtube" style="color: #ff0000; font-size: 1.2rem;"></i>`;
            return;
        }

        if (facebookPlatform.regex.test(value)) {
            userInput.label = "Enlace de Facebook detectado";
            inputPrefix.innerHTML = `<i class="fa-brands fa-facebook" style="color: #1877f2; font-size: 1.2rem;"></i>`;
            return;
        }

        if (tiktokPlatform.regex.test(value)) {
            userInput.label = "Enlace de TikTok detectado";
            inputPrefix.innerHTML = `<i class="fa-brands fa-tiktok" style="color: var(--md-sys-color-primary); font-size: 1.2rem;"></i>`;
            return;
        }

        if (instagramPlatform.regex.test(value)) {
            userInput.label = "Enlace de Instagram detectado";
            inputPrefix.innerHTML = `<i class="fa-brands fa-instagram" style="color: #e1306c; font-size: 1.2rem;"></i>`;
            return;
        }

        if (currentPlatform === 'instagram') {
            userInput.label = "Nombre de usuario de Instagram";
            inputPrefix.innerHTML = `<span style="font-weight: 700; color: var(--md-sys-color-primary); font-size: 1.2rem; line-height: 1;">@</span>`;
        } else if (currentPlatform === 'tiktok') {
            userInput.label = "Buscar en TikTok";
            inputPrefix.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i>`;
        } else {
            userInput.label = "Búsqueda o link de YouTube";
            inputPrefix.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i>`;
        }
    }

    // --- CREACIÓN DE CHIPS 🥔 ---
    let platformChipsContainer = document.getElementById('platformChipsContainer');
    if (!platformChipsContainer) {
        platformChipsContainer = document.createElement('div');
        platformChipsContainer.id = 'platformChipsContainer';
        platformChipsContainer.style.cssText = 'display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-top: 16px;';
        platformChipsContainer.innerHTML = `
            <md-chip-set id="platformChipSet">
                <md-filter-chip label="YouTube" data-platform="youtube" selected></md-filter-chip>
                <md-filter-chip label="Instagram" data-platform="instagram"></md-filter-chip>
                <md-filter-chip label="TikTok" data-platform="tiktok"></md-filter-chip>
                <md-filter-chip label="Spotify" data-platform="spotify"></md-filter-chip>
                <md-filter-chip label="Imágenes" data-platform="images"></md-filter-chip>
            </md-chip-set>
        `;
        actionForm.parentNode.insertBefore(platformChipsContainer, actionForm.nextSibling);

        const chips = platformChipsContainer.querySelectorAll('md-filter-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                currentPlatform = chip.getAttribute('data-platform');

                chips.forEach(c => {
                    c.selected = (c === chip);
                });

                updatePlatformInputMode();
                processInput();

                if (currentPlatform !== 'youtube' && currentPlatform !== 'instagram' && currentPlatform !== 'tiktok') {
                    showUnavailableModal(currentPlatform);
                }
            });
        });
    }

    function showUnavailableModal(platformName) {
        if (dialog) {
            const platformFormatted = platformName.charAt(0).toUpperCase() + platformName.slice(1);
            const contentDiv = dialog.querySelector('div[slot="content"]') || dialog;
            contentDiv.innerHTML = `La búsqueda en <strong>${platformFormatted}</strong> aún no está disponible de momento. ¡Próximamente!`;
            dialog.show();
        } else {
            alert(`La búsqueda en ${platformName} aún no está disponible.`);
        }
    }

    // --- LÓGICA PRINCIPAL ---
    function setEnterKeyHint(hintType) {
        userInput.setAttribute('enterkeyhint', hintType);
        const innerInput = userInput.shadowRoot?.querySelector('input');
        if (innerInput) {
            innerInput.setAttribute('enterkeyhint', hintType);
        }
    }

    function setButtonState(type, text, iconClass) {
        actionBtn.setAttribute('data-action', type);
        actionText.textContent = text;
        actionIcon.className = iconClass;
    }

    function processInput() {
        let value = userInput.value;

        if (currentPlatform === 'instagram' && !instagramPlatform.regex.test(value)) {
            value = value.replace(/\s+/g, '');
            userInput.value = value;
        }

        updatePlatformInputMode();

        value = value.trim();
        userInput.error = false;
        actionBtn.classList.add('hidden-view');

        if (platformChipsContainer) {
            platformChipsContainer.classList.remove('hidden-view');
        }

        if (value === '') {
            clearBtn.style.display = 'none';
            setEnterKeyHint('search');
            return;
        }
        clearBtn.style.display = 'inline-flex';

        if (youtubePlatform.regex.test(value) || facebookPlatform.regex.test(value) || instagramPlatform.regex.test(value) || tiktokPlatform.regex.test(value)) {
            setButtonState('download', 'Descargar', 'fa-solid fa-download');
            setEnterKeyHint('send');
            actionBtn.classList.remove('hidden-view');
            if (platformChipsContainer) {
                platformChipsContainer.classList.add('hidden-view');
            }
        }
        else if (currentPlatform === 'instagram') {
            setButtonState('search', 'Buscar', 'fa-solid fa-magnifying-glass');
            setEnterKeyHint('search');
            actionBtn.classList.remove('hidden-view');
        }
        else if (generalUrlRegex.test(value)) {
            userInput.error = true;
            setEnterKeyHint('done');
        }
        else {
            setButtonState('search', 'Buscar', 'fa-solid fa-magnifying-glass');
            setEnterKeyHint('search');
            actionBtn.classList.remove('hidden-view');
        }
    }

    userInput.addEventListener('input', processInput);

    actionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!actionBtn.classList.contains('hidden-view')) {
            actionBtn.click();
        }
    });

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!actionBtn.classList.contains('hidden-view')) {
                actionBtn.click();
            }
        }
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            userInput.value = text;
            processInput();
        } catch (err) {
            alert('No se pudo acceder al portapapeles.');
        }
    });

    clearBtn.addEventListener('click', () => {
        userInput.value = '';
        processInput();
        userInput.focus();
    });

    actionBtn.addEventListener('click', () => {
        let val = userInput.value.trim();
        const currentAction = actionBtn.getAttribute('data-action');

        if (currentAction === 'download') {
            if (facebookPlatform.regex.test(val)) {
                facebookPlatform.handleDownloadAction(val, 'searchView');
            } else if (tiktokPlatform.regex.test(val)) {
                tiktokPlatform.handleDownloadAction(val, 'searchView');
            } else if (instagramPlatform.regex.test(val)) {
                instagramPlatform.handleDownloadAction(val, 'searchView');
            } else {
                youtubePlatform.handleDownloadAction(val, 'searchView');
            }
        } else if (currentAction === 'search') {
            if (currentPlatform === 'youtube') {
                youtubePlatform.handleSearchAction(val);
            } else if (currentPlatform === 'tiktok') {
                tiktokPlatform.handleSearchAction(val);
            } else if (currentPlatform === 'instagram') {
                if (!val.startsWith('http')) {
                    val = `https://www.instagram.com/${val.toLowerCase()}`;
                }
                instagramPlatform.handleDownloadAction(val, 'searchView');
            } else {
                showUnavailableModal(currentPlatform);
            }
        }
    });

    // --- BOTÓN "VOLVER" ---
    backBtn.addEventListener('click', () => {
        resultsView.classList.add('hidden-view');
        searchView.classList.remove('hidden-view');
        userInput.value = '';
        processInput();
        userInput.focus();
    });

    if (closeDialogBtn) {
        closeDialogBtn.addEventListener('click', () => {
            dialog.close();
        });
    }

    // --- TEMAS ---
    let currentFolder = localStorage.getItem('preferred_theme_folder') || 'blue-teal';
    let currentMode = localStorage.getItem('preferred_theme_mode') || 'light';
    let currentContrast = localStorage.getItem('preferred_theme_contrast') || '';

    function applyTheme(folder, mode, contrast) {
        currentFolder = folder;
        currentMode = mode;
        currentContrast = contrast;

        const themeFileName = currentMode + currentContrast;
        themeStylesheet.href = `${currentFolder}/${themeFileName}.css`;
        document.body.className = themeFileName;

        localStorage.setItem('preferred_theme_folder', currentFolder);
        localStorage.setItem('preferred_theme_mode', currentMode);
        localStorage.setItem('preferred_theme_contrast', currentContrast);

        if (currentMode === 'dark') {
            modeIcon.className = 'fa-solid fa-sun';
            modeToggleBtn.title = 'Cambiar a modo Claro';
        } else {
            modeIcon.className = 'fa-solid fa-moon';
            modeToggleBtn.title = 'Cambiar a modo Oscuro';
        }

        contrastStandardBtn.style.opacity = currentContrast === '' ? '1' : '0.5';
        contrastMediumBtn.style.opacity = currentContrast === '-mc' ? '1' : '0.5';
        contrastHighBtn.style.opacity = currentContrast === '-hc' ? '1' : '0.5';
    }

    applyTheme(currentFolder, currentMode, currentContrast);

    themeMenuBtn.addEventListener('click', () => {
        themeMenu.open = !themeMenu.open;
    });

    document.querySelectorAll('#themeMenu md-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const selectedFolder = item.getAttribute('data-value');
            if (selectedFolder) {
                applyTheme(selectedFolder, currentMode, currentContrast);
            }
        });
    });

    modeToggleBtn.addEventListener('click', () => {
        const newMode = currentMode === 'dark' ? 'light' : 'dark';
        applyTheme(currentFolder, newMode, currentContrast);
    });

    contrastStandardBtn.addEventListener('click', () => applyTheme(currentFolder, currentMode, ''));
    contrastMediumBtn.addEventListener('click', () => applyTheme(currentFolder, currentMode, '-mc'));
    contrastHighBtn.addEventListener('click', () => applyTheme(currentFolder, currentMode, '-hc'));
});
