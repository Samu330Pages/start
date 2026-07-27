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
    const detailsView = document.getElementById('detailsView');
    const detailsBackBtn = document.getElementById('detailsBackBtn');
    const detailsLoading = document.getElementById('detailsLoading');
    const detailsContent = document.getElementById('detailsContent');
    const detailsError = document.getElementById('detailsError');
    const infoThumb = document.getElementById('infoThumb');
    const infoTitle = document.getElementById('infoTitle');
    const infoChannel = document.getElementById('infoChannel');
    const infoDuration = document.getElementById('infoDuration');
    const infoViews = document.getElementById('infoViews');
    const infoDescription = document.getElementById('infoDescription');
    const typeChips = document.querySelectorAll('.type-chip');
    const audioSwitchContainer = document.getElementById('audioSwitchContainer');
    const mp3Switch = document.getElementById('mp3Switch');
    const singleSelectContainer = document.getElementById('singleSelectContainer');
    const fusionSelectContainer = document.getElementById('fusionSelectContainer');
    const formatSelect = document.getElementById('formatSelect');
    const videoFormatSelect = document.getElementById('videoFormatSelect');
    const audioFormatSelect = document.getElementById('audioFormatSelect');
    const startDownloadBtn = document.getElementById('startDownloadBtn');
    const themeFolderSelect = document.getElementById('themeFolderSelect');
    const themeMenuBtn = document.getElementById('themeMenuBtn');
    const themeMenu = document.getElementById('themeMenu');
    const themeStylesheet = document.getElementById('theme-stylesheet');
    const modeToggleBtn = document.getElementById('modeToggleBtn');
    const modeIcon = document.getElementById('modeIcon');
    const contrastStandardBtn = document.getElementById('contrastStandardBtn');
    const contrastMediumBtn = document.getElementById('contrastMediumBtn');
    const contrastHighBtn = document.getElementById('contrastHighBtn');
    const dialog = document.getElementById('warningDialog');
    const closeDialogBtn = document.getElementById('closeWarningBtn');
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i;
    const generalUrlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i;
    let currentNavigationSource = 'searchView';
    let apiFormatsData = [];
    let selectedType = 'audio_only';
    let currentVideoUrl = '';
    let currentFolder = 'blue-teal';
    let currentMode = 'light';
    let currentContrast = '';
    let isDownloading = false;

    function showDownloadWarning() {
        if (dialog) {
            dialog.show();
        }
    }

    function setEnterKeyHint(hintType) {
        userInput.setAttribute('enterkeyhint', hintType);
        const innerInput = userInput.shadowRoot?.querySelector('input');
        if (innerInput) {
            innerInput.setAttribute('enterkeyhint', hintType);
        }
    }

    function processInput() {
        let value = userInput.value.trim();
        userInput.error = false;
        actionBtn.classList.add('hidden-view');
        if (value === '') {
            clearBtn.style.display = 'none';
            setEnterKeyHint('search');
            return;
        }
        clearBtn.style.display = 'inline-flex';
        if (ytRegex.test(value)) {
            setButtonState('download', 'Descargar', 'fa-solid fa-download');
            setEnterKeyHint('send');
            actionBtn.classList.remove('hidden-view');
        } else if (generalUrlRegex.test(value)) {
            userInput.error = true;
            setEnterKeyHint('done');
        } else {
            setButtonState('search', 'Buscar', 'fa-solid fa-magnifying-glass');
            setEnterKeyHint('search');
            actionBtn.classList.remove('hidden-view');
        }
    }

    function setButtonState(type, text, iconClass) {
        actionBtn.setAttribute('data-action', type);
        actionText.textContent = text;
        actionIcon.className = iconClass;
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
            fetchVideoInfo(val, 'searchView');
        } else if (currentAction === 'search') {
            executeSearch(val);
        }
    });
    async function executeSearch(query) {
        searchView.classList.add('hidden-view');
        resultsView.classList.remove('hidden-view');
        queryLabel.textContent = `"${query}"`;
        loadingIndicator.classList.remove('hidden-view');
        resultsContainer.classList.add('hidden-view');
        resultsContainer.innerHTML = '';
        try {
            const response = await fetch(`https://api.samu330.com/yt/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            loadingIndicator.classList.add('hidden-view');
            resultsContainer.classList.remove('hidden-view');
            if (data.success && data.results && data.results.length > 0) {
                data.results.forEach(video => {
                    const card = document.createElement('div');
                    card.className = 'yt-card';
                    const durationText = video.duration ? video.duration : 'N/A';
                    card.innerHTML = `
                                <div class="yt-thumbnail-container">
                                    <img class="yt-thumbnail" src="${video.thumbnail}" alt="${escapeHtml(video.title)}">
                                    <span class="yt-duration">${durationText}</span>
                                </div>
                                <div class="yt-details">
                                    <h3 class="yt-title">${escapeHtml(video.title)}</h3>
                                    <p class="yt-uploader"><i class="fa-solid fa-user-tag"></i> ${escapeHtml(video.uploader || 'Desconocido')}</p>
                                    <md-filled-tonal-button class="download-item-btn" data-url="${video.url}">
                                        <i class="fa-solid fa-download" slot="icon"></i>
                                        Descargar
                                    </md-filled-tonal-button>
                                </div>
                            `;
                    const dlBtn = card.querySelector('.download-item-btn');
                    dlBtn.addEventListener('click', () => {
                        fetchVideoInfo(video.url, 'resultsView');
                    });
                    resultsContainer.appendChild(card);
                });
            } else {
                const errorMessage = data.error || 'No se encontraron resultados para esta búsqueda.';
                resultsContainer.innerHTML = `
                            <div class="error-box">
                                <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem;"></i>
                                <span>${escapeHtml(errorMessage)}</span>
                            </div>
                        `;
            }
        } catch (error) {
            loadingIndicator.classList.add('hidden-view');
            resultsContainer.classList.remove('hidden-view');
            resultsContainer.innerHTML = `
                        <div class="error-box">
                            <i class="fa-solid fa-circle-exclamation" style="font-size: 1.5rem;"></i>
                            <span>Error de red al conectar con la API de búsqueda.</span>
                        </div>
                    `;
        }
    }
    async function fetchVideoInfo(videoUrl, fromSource) {
        currentNavigationSource = fromSource;
        currentVideoUrl = videoUrl;
        searchView.classList.add('hidden-view');
        resultsView.classList.add('hidden-view');
        detailsView.classList.remove('hidden-view');
        detailsLoading.classList.remove('hidden-view');
        detailsContent.classList.add('hidden-view');
        detailsError.classList.add('hidden-view');
        try {
            const response = await fetch(`https://api.samu330.com/yt/info?url=${encodeURIComponent(videoUrl)}`);
            const data = await response.json();
            detailsLoading.classList.add('hidden-view');
            if (data.success && data.metadata) {
                detailsContent.classList.remove('hidden-view');
                infoThumb.src = data.metadata.thumbnail;
                infoTitle.textContent = data.metadata.title;
                infoChannel.textContent = data.metadata.channel;
                infoDuration.textContent = data.metadata.duration_formatted;
                infoViews.textContent = formatViews(data.metadata.views);
                infoDescription.textContent = data.metadata.description || 'Sin descripción disponible.';
                apiFormatsData = data.formats || [];
                selectedType = 'audio_only';
                updateTypeSelectorUI();
                populateFormatDropdowns();
            } else {
                detailsError.classList.remove('hidden-view');
                const errorMsg = data.error || 'No se pudo obtener la información del video.';
                detailsError.innerHTML = `
                            <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem;"></i>
                            <span>${escapeHtml(errorMsg)}</span>
                        `;
            }
        } catch (error) {
            detailsLoading.classList.add('hidden-view');
            detailsError.classList.remove('hidden-view');
            detailsError.innerHTML = `
                        <i class="fa-solid fa-circle-exclamation" style="font-size: 1.5rem;"></i>
                        <span>Error de conexión al obtener los detalles del video.</span>
                    `;
        }
    }
    typeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            selectedType = chip.getAttribute('data-type');
            updateTypeSelectorUI();
            populateFormatDropdowns();
        });
    });

    function updateTypeSelectorUI() {
        typeChips.forEach(chip => {
            if (chip.getAttribute('data-type') === selectedType) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
        if (selectedType === 'audio_only') {
            audioSwitchContainer.style.display = 'flex';
        } else {
            audioSwitchContainer.style.display = 'none';
        }
        if (selectedType === 'fusion') {
            singleSelectContainer.classList.add('hidden-view');
            fusionSelectContainer.classList.remove('hidden-view');
        } else {
            singleSelectContainer.classList.remove('hidden-view');
            fusionSelectContainer.classList.add('hidden-view');
        }
    }

    function getFormattedSize(f) {
        if (f.filesize_mb && f.filesize_mb !== 'Desconocido' && f.filesize_mb !== 'null') {
            return ` - ${f.filesize_mb}`;
        }
        if (f.filesize) {
            const mb = (f.filesize / (1024 * 1024)).toFixed(2);
            return ` - ${mb} MB`;
        }
        return '';
    }

    function populateFormatDropdowns() {
        formatSelect.value = '';
        videoFormatSelect.value = '';
        audioFormatSelect.value = '';
        checkDownloadButtonState();
        if (selectedType === 'fusion') {
            videoFormatSelect.innerHTML = '<md-select-option value="" disabled selected></md-select-option>';
            const videoFormats = apiFormatsData.filter(f => f.type === 'video_only');
            videoFormats.forEach(f => {
                const opt = document.createElement('md-select-option');
                opt.value = f.format_id;

                const codecIndicator = getCodecInfo(f.vcodec);
                const label = `${f.resolution}${codecIndicator} [.${f.ext}]${getFormattedSize(f)}`;

                const div = document.createElement('div');
                div.slot = 'headline';
                div.textContent = label;
                opt.appendChild(div);
                videoFormatSelect.appendChild(opt);
            });
            audioFormatSelect.innerHTML = '<md-select-option value="" disabled selected></md-select-option>';
            const audioFormats = apiFormatsData.filter(f => f.type === 'audio_only');
            audioFormats.forEach(f => {
                const opt = document.createElement('md-select-option');
                opt.value = f.format_id;
                const bitrate = f.audio_bitrate ? f.audio_bitrate : 'Estándar';
                const label = `Audio (${bitrate}) [.${f.ext}]${getFormattedSize(f)}`;
                const div = document.createElement('div');
                div.slot = 'headline';
                div.textContent = label;
                opt.appendChild(div);
                audioFormatSelect.appendChild(opt);
            });
        } else {
            formatSelect.innerHTML = '<md-select-option value="" disabled selected></md-select-option>';
            const filteredFormats = apiFormatsData.filter(f => f.type === selectedType);
            if (filteredFormats.length === 0) {
                const opt = document.createElement('md-select-option');
                opt.disabled = true;
                const div = document.createElement('div');
                div.slot = 'headline';
                div.textContent = 'No hay formatos disponibles';
                opt.appendChild(div);
                formatSelect.appendChild(opt);
                return;
            }
            filteredFormats.forEach(f => {
                const opt = document.createElement('md-select-option');
                opt.value = f.format_id;
                let label = '';
                if (f.type === 'audio_only') {
                    const bitrate = f.audio_bitrate ? f.audio_bitrate : 'Estándar';
                    label = `Audio (${bitrate}) [.${f.ext}]${getFormattedSize(f)}`;
                } else {
                    const audioNote = f.audio_ext ? ` (${f.audio_ext})` : '';

                    const codecIndicator = getCodecInfo(f.vcodec);
                    label = `${f.resolution}${codecIndicator} [.${f.ext}]${audioNote}${getFormattedSize(f)}`;
                }
                const div = document.createElement('div');
                div.slot = 'headline';
                div.textContent = label;
                opt.appendChild(div);
                formatSelect.appendChild(opt);
            });
        }
    }
    formatSelect.addEventListener('input', checkDownloadButtonState);
    videoFormatSelect.addEventListener('input', checkDownloadButtonState);
    audioFormatSelect.addEventListener('input', checkDownloadButtonState);

    function checkDownloadButtonState() {
        if (selectedType === 'fusion') {
            if (videoFormatSelect.value && audioFormatSelect.value) {
                startDownloadBtn.disabled = false;
            } else {
                startDownloadBtn.disabled = true;
            }
        } else {
            if (formatSelect.value) {
                startDownloadBtn.disabled = false;
            } else {
                startDownloadBtn.disabled = true;
            }
        }
    }
    startDownloadBtn.addEventListener('click', async () => {
        if (!currentVideoUrl) return;
        startDownloadBtn.disabled = true;
        isDownloading = true;
        history.pushState({ downloading: true }, '', window.location.href);
        const originalContent = startDownloadBtn.innerHTML;

        startDownloadBtn.innerHTML = `<i class="fa-solid fa-hourglass-half fa-spin" slot="icon"></i> Por favor espere...`;

        let downloadUrl = '';
        if (selectedType === 'fusion') {
            const videoFormatId = videoFormatSelect.value;
            const audioFormatId = audioFormatSelect.value;
            if (videoFormatId && audioFormatId) {
                downloadUrl = `https://api.samu330.com/yt/download?url=${encodeURIComponent(currentVideoUrl)}&format=${videoFormatId}+${audioFormatId}`;
            }
        } else {
            const formatId = formatSelect.value;
            if (formatId) {
                downloadUrl = `https://api.samu330.com/yt/download?url=${encodeURIComponent(currentVideoUrl)}&format=${formatId}`;
                if (selectedType === 'audio_only' && mp3Switch.selected) {
                    downloadUrl += `&audio_format=mp3`;
                }
            }
        }

        if (!downloadUrl) {
            startDownloadBtn.disabled = false;
            startDownloadBtn.innerHTML = originalContent;
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
        startDownloadBtn.innerHTML = `<i class="fa-solid fa-server fa-bounce" slot="icon"></i> Solicitud recibida por el servidor...`;

        try {
            const response = await fetch(downloadUrl);

            if (!response.ok) {
                throw new Error('Error al procesar la descarga en el servidor.');
            }

            const disposition = response.headers.get('content-disposition');
            let filename = 'video_descargado.mp4';

            if (disposition) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
                    filename = match[1];
                }
            }

            const contentLength = response.headers.get('content-length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;

            const reader = response.body.getReader();
            let receivedLength = 0;
            let chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                receivedLength += value.length;

                if (total > 0) {
                    const percent = Math.round((receivedLength / total) * 100);
                    startDownloadBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-down fa-bounce" slot="icon"></i> Descargando: ${percent}%`;
                } else {
                    const mbReceived = (receivedLength / (1024 * 1024)).toFixed(1);
                    startDownloadBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-down fa-bounce" slot="icon"></i> Descargando... (${mbReceived} MB)`;
                }
            }

            const blob = new Blob(chunks);
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);

            startDownloadBtn.innerHTML = `<i class="fa-solid fa-circle-check" slot="icon"></i> ¡Descarga completada!`;

        } catch (error) {
            console.error('Error en la descarga:', error);
            startDownloadBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation" slot="icon"></i> Error en la descarga`;
        } finally {
            isDownloading = false;
            setTimeout(() => {
                startDownloadBtn.disabled = false;
                startDownloadBtn.innerHTML = originalContent;
            }, 4000);
        }
    });

    function getCodecInfo(vcodec = '') {
        if (!vcodec) return '';
        if (vcodec.toLowerCase().includes('avc1')) {
            return ' 🟢';
        }
        return ' ⚠️';
    }

    function formatViews(views) {
        if (!views && views !== 0) return '0 vistas';
        return new Intl.NumberFormat('es-ES').format(views) + ' vistas';
    }

    //temas y colores
    function applyTheme(folder, mode, contrast) {
        currentFolder = folder;
        currentMode = mode;
        currentContrast = contrast;

        const themeFileName = currentMode + currentContrast;
        const fullStylesheetPath = `${currentFolder}/${themeFileName}.css`;

        themeStylesheet.href = fullStylesheetPath;

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

    const savedFolder = localStorage.getItem('preferred_theme_folder') || 'blue-teal';
    const savedMode = localStorage.getItem('preferred_theme_mode') || 'light';
    const savedContrast = localStorage.getItem('preferred_theme_contrast') || '';

    applyTheme(savedFolder, savedMode, savedContrast);

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
    ////

    //botón de "volver"
    backBtn.addEventListener('click', () => {
        resultsView.classList.add('hidden-view');
        searchView.classList.remove('hidden-view');
        userInput.value = '';
        processInput();
        userInput.focus();
    });

    detailsBackBtn.addEventListener('click', (e) => {
        if (isDownloading) {
            showDownloadWarning();
            return;
        }
        detailsView.classList.add('hidden-view');
        if (currentNavigationSource === 'resultsView') {
            resultsView.classList.remove('hidden-view');
        } else {
            searchView.classList.remove('hidden-view');
        }
    });
    ////

    closeDialogBtn.addEventListener('click', () => {
        dialog.close();
    });

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function (m) {
            return map[m];
        });
    }

    window.addEventListener('popstate', (e) => {
        if (isDownloading) {
            history.pushState(null, '', window.location.href);
            showDownloadWarning();
        }
    });

    window.addEventListener('beforeunload', (e) => {
        if (isDownloading) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
});