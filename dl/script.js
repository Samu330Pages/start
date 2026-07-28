import { youtubePlatform } from './yt/yt.js';
//import { tiktokPlatform } from './tiktok/tiktok.js';

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

    // Temas y diálogos
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

    //tiktokPlatform.init(sharedDom);

    // --- CREACIÓN DE CHIPS 🥔 ---
    let platformChipsContainer = document.getElementById('platformChipsContainer');
    if (!platformChipsContainer) {
        platformChipsContainer = document.createElement('div');
        platformChipsContainer.id = 'platformChipsContainer';
        platformChipsContainer.className = 'hidden-view';
        platformChipsContainer.style.cssText = 'display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-top: 16px;';
        platformChipsContainer.innerHTML = `
            <md-chip-set id="platformChipSet">
                <md-filter-chip label="YouTube" data-platform="youtube" selected></md-filter-chip>
                <md-filter-chip label="Spotify" data-platform="spotify"></md-filter-chip>
                <md-filter-chip label="Instagram" data-platform="instagram"></md-filter-chip>
                <md-filter-chip label="Imágenes" data-platform="images"></md-filter-chip>
            </md-chip-set>
        `;
        actionForm.parentNode.insertBefore(platformChipsContainer, actionForm.nextSibling);

        const chips = platformChipsContainer.querySelectorAll('md-filter-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.selected = false);
                chip.selected = true;

                const platform = chip.getAttribute('data-platform');
                if (platform !== 'youtube') {
                    showUnavailableModal(platform);
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
        let value = userInput.value.trim();
        userInput.error = false;
        actionBtn.classList.add('hidden-view');

        if (value === '') {
            clearBtn.style.display = 'none';
            setEnterKeyHint('search');
            if (platformChipsContainer) platformChipsContainer.classList.add('hidden-view');
            return;
        }
        clearBtn.style.display = 'inline-flex';

        if (youtubePlatform.regex.test(value) /*|| tiktokPlatform.regex.test(value)*/) {
            setButtonState('download', 'Descargar', 'fa-solid fa-download');
            setEnterKeyHint('send');
            actionBtn.classList.remove('hidden-view');
            if (platformChipsContainer) platformChipsContainer.classList.add('hidden-view');
        } else if (generalUrlRegex.test(value)) {
            userInput.error = true;
            setEnterKeyHint('done');
            if (platformChipsContainer) platformChipsContainer.classList.add('hidden-view');
        } else {
            setButtonState('search', 'Buscar', 'fa-solid fa-magnifying-glass');
            setEnterKeyHint('search');
            actionBtn.classList.remove('hidden-view');
            if (platformChipsContainer) platformChipsContainer.classList.remove('hidden-view');
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
        const val = userInput.value.trim();
        const currentAction = actionBtn.getAttribute('data-action');

        if (currentAction === 'download') {
            if (tiktokPlatform.regex.test(val)) {
                tiktokPlatform.handleDownloadAction(val, 'searchView');
            } else {
                youtubePlatform.handleDownloadAction(val, 'searchView');
            }
        } else if (currentAction === 'search') {
            const selectedChip = platformChipsContainer ? platformChipsContainer.querySelector('md-filter-chip[selected]') : null;
            const targetPlatform = selectedChip ? selectedChip.getAttribute('data-platform') : 'youtube';

            if (targetPlatform === 'youtube') {
                youtubePlatform.handleSearchAction(val);
            } else {
                showUnavailableModal(targetPlatform);
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