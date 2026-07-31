export const youtubePlatform = {
    id: 'youtube',
    name: 'YouTube',
    regex: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i,
    supportsSearch: true,

    dom: {},
    apiFormatsData: [],
    selectedType: 'audio_only',
    currentVideoUrl: '',
    currentNavigationSource: 'searchView',
    isDownloading: false,

    init(domElements) {
        this.dom = domElements; 
        this.initGlobalListeners();
    },

    initGlobalListeners() {
        window.addEventListener('popstate', () => {
            if (this.isDownloading) {
                history.pushState(null, '', window.location.href);
                this.showDownloadWarning();
            }
        });

        window.addEventListener('beforeunload', (e) => {
            if (this.isDownloading) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    },

    showDownloadWarning() {
        if (this.dom.warningDialog) {
            this.dom.warningDialog.show();
        }
    },

    handleSearchAction(query) {
        this.executeSearch(query);
    },

    handleDownloadAction(url, source) {
        this.fetchVideoInfo(url, source);
    },

    async executeSearch(query) {
        this.dom.searchView.classList.add('hidden-view');
        this.dom.resultsView.classList.remove('hidden-view');
        this.dom.queryLabel.textContent = `"${query}"`;
        this.dom.loadingIndicator.classList.remove('hidden-view');
        this.dom.resultsContainer.classList.add('hidden-view');
        this.dom.resultsContainer.innerHTML = '';

        try {
            const response = await fetch(`https://api.samu330.com/yt/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            this.dom.loadingIndicator.classList.add('hidden-view');
            this.dom.resultsContainer.classList.remove('hidden-view');

            if (data.success && data.results && data.results.length > 0) {
                data.results.forEach(video => {
                    const card = document.createElement('div');
                    card.className = 'yt-card';
                    const durationText = video.duration ? video.duration : 'N/A';
                    card.innerHTML = `
                        <div class="yt-thumbnail-container">
                            <img class="yt-thumbnail" src="${video.thumbnail}" alt="${this.escapeHtml(video.title)}">
                            <span class="yt-duration">${durationText}</span>
                        </div>
                        <div class="yt-details">
                            <h3 class="yt-title">${this.escapeHtml(video.title)}</h3>
                            <p class="yt-uploader"><i class="fa-solid fa-user-tag"></i> ${this.escapeHtml(video.uploader || 'Desconocido')}</p>
                            <md-filled-tonal-button class="download-item-btn" data-url="${video.url}">
                                <i class="fa-solid fa-download" slot="icon"></i>
                                Descargar
                            </md-filled-tonal-button>
                        </div>
                    `;
                    card.querySelector('.download-item-btn').addEventListener('click', () => {
                        this.fetchVideoInfo(video.url, 'resultsView');
                    });
                    this.dom.resultsContainer.appendChild(card);
                });
            } else {
                const errorMessage = data.error || 'No se encontraron resultados para esta búsqueda.';
                this.dom.resultsContainer.innerHTML = `
                    <div class="error-box">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem;"></i>
                        <span>${this.escapeHtml(errorMessage)}</span>
                    </div>
                `;
            }
        } catch (error) {
            this.dom.loadingIndicator.classList.add('hidden-view');
            this.dom.resultsContainer.classList.remove('hidden-view');
            this.dom.resultsContainer.innerHTML = `
                <div class="error-box">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 1.5rem;"></i>
                    <span>Error de red al conectar con la API de búsqueda.</span>
                </div>
            `;
        }
    },

    async fetchVideoInfo(videoUrl, fromSource) {
        this.currentNavigationSource = fromSource;
        this.currentVideoUrl = videoUrl;
        this.dom.searchView.classList.add('hidden-view');
        this.dom.resultsView.classList.add('hidden-view');

        const container = this.dom.platformDetailsView;
        container.classList.remove('hidden-view');

        container.innerHTML = `
            <div class="card">
                <div class="results-header">
                    <h2>Detalles del Video</h2>
                    <md-outlined-button id="detailsBackBtn">
                        <i class="fa-solid fa-arrow-left" slot="icon"></i> Volver
                    </md-outlined-button>
                </div>
                <div id="detailsLoading" class="loading-container">
                    <md-circular-progress indeterminate></md-circular-progress>
                    <span>Obteniendo información...</span>
                </div>
                <div id="detailsContent" class="details-scroll-container hidden-view"></div>
                <div id="detailsError" class="error-box hidden-view" style="margin-top: 16px;"></div>
            </div>
        `;

        container.querySelector('#detailsBackBtn').addEventListener('click', () => this.goBack());

        const detailsLoading = container.querySelector('#detailsLoading');
        const detailsContent = container.querySelector('#detailsContent');
        const detailsError = container.querySelector('#detailsError');

        try {
            const response = await fetch(`https://api.samu330.com/yt/info?url=${encodeURIComponent(videoUrl)}`);
            const data = await response.json();
            detailsLoading.classList.add('hidden-view');

            if (data.success && data.metadata) {
                detailsContent.classList.remove('hidden-view');
                this.apiFormatsData = data.formats || [];
                this.selectedType = 'audio_only';
                this.renderDetailsUI(detailsContent, data.metadata);
            } else {
                detailsError.classList.remove('hidden-view');
                const errorMsg = data.error || 'No se pudo obtener la información del video.';
                detailsError.innerHTML = `
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem;"></i>
                    <span>${this.escapeHtml(errorMsg)}</span>
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
    },

    renderDetailsUI(wrapper, meta) {
        wrapper.innerHTML = `
            <div class="video-hero">
                <div class="video-hero-thumb-container">
                    <img id="infoThumb" class="video-hero-thumb" src="${meta.thumbnail}" alt="Thumbnail">
                </div>
                <div class="video-hero-meta">
                    <h3 id="infoTitle" class="video-hero-title">${this.escapeHtml(meta.title)}</h3>
                    <div class="video-hero-stats">
                        <span>
                            <i class="fa-solid fa-user-tag"></i>
                            <strong id="infoChannel">${this.escapeHtml(meta.channel)}</strong>
                        </span>
                        <span>
                            <i class="fa-solid fa-clock"></i>
                            <span id="infoDuration">${meta.duration_formatted}</span>
                        </span>
                        <span>
                            <i class="fa-solid fa-eye"></i>
                            <span id="infoViews">${this.formatViews(meta.views)}</span>
                        </span>
                    </div>
                </div>
            </div>
            <details class="description-box">
                <summary>Ver Descripción</summary>
                <div id="infoDescription" class="description-text">${this.escapeHtml(meta.description || 'Sin descripción disponible.')}</div>
            </details>
            
            <div class="download-options-card">
                <h4 class="options-title">
                    <i class="fa-solid fa-sliders"></i> Opciones de Descarga
                </h4>

                <div class="codec-info-banner" style="margin: 12px 0; padding: 12px; border-radius: 8px; background: var(--md-sys-color-surface-container-low, #f1f3f4); font-size: 0.8rem; display: flex; flex-direction: column; gap: 6px;">
                    <div style="font-weight: 500; display: flex; align-items: center; gap: 6px; color: var(--md-sys-color-primary);">
                        <i class="fa-solid fa-circle-info"></i>
                        <span>Guía de Compatibilidad de Códecs</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-circle-check" style="color: #2e7d32;"></i>
                        <span><strong>Alta compatibilidad (AVC1/H.264):</strong> Reproducción universal en cualquier dispositivo o TV.</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-triangle-exclamation" style="color: #ed6c02;"></i>
                        <span><strong>Alta eficiencia (AV1 / VP9):</strong> Excelente calidad/peso, pero requiere reproductores modernos.</span>
                    </div>
                </div>

                <div class="type-selector">
                    <div class="type-chip ${this.selectedType === 'audio_only' ? 'active' : ''}" data-type="audio_only">
                        <i class="fa-solid fa-music"></i>
                        <span>Audio</span>
                    </div>
                    <div class="type-chip ${this.selectedType === 'video+audio' ? 'active' : ''}" data-type="video+audio">
                        <i class="fa-solid fa-film"></i>
                        <span>Vídeo + Audio</span>
                    </div>
                    <div class="type-chip ${this.selectedType === 'fusion' ? 'active' : ''}" data-type="fusion">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                        <span>Fusionar</span>
                    </div>
                </div>

                <div id="audioSwitchContainer" style="display: ${this.selectedType === 'audio_only' ? 'flex' : 'none'};">
                    <md-switch id="mp3Switch" icons></md-switch>
                    <span>Convertir audio a MP3</span>
                </div>

                <div id="singleSelectContainer" class="${this.selectedType === 'fusion' ? 'hidden-view' : ''}">
                    <md-outlined-select id="formatSelect" label="Calidad / Formato">
                        <md-select-option value="" disabled selected></md-select-option>
                    </md-outlined-select>
                </div>

                <div id="fusionSelectContainer" class="${this.selectedType === 'fusion' ? '' : 'hidden-view'}" style="display: flex; flex-direction: column; gap: 12px;">
                    <div class="warning-badge">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <span>Selecciona el formato de vídeo y de audio deseado para convertir y fusionar.</span>
                    </div>
                    <md-outlined-select id="videoFormatSelect" label="Formato de Vídeo">
                        <md-select-option value="" disabled selected></md-select-option>
                    </md-outlined-select>
                    <md-outlined-select id="audioFormatSelect" label="Formato de Audio">
                        <md-select-option value="" disabled selected></md-select-option>
                    </md-outlined-select>
                </div>
                
                <md-filled-button id="startDownloadBtn" disabled style="width: 100%;">
                    <i class="fa-solid fa-download" slot="icon"></i> Descargar / Procesar
                </md-filled-button>
            </div>

            <!-- Diálogo Material Web nativo con barra de progreso (bloqueado contra clics externos) -->
            <md-dialog id="downloadProgressDialog" style="min-width: 320px;">
                <div slot="headline">Descargando archivo</div>
                <div slot="content" style="display: flex; flex-direction: column; gap: 16px; padding-top: 8px;">
                    <p style="margin: 0; font-size: 0.9rem; color: var(--md-sys-color-on-surface-variant); line-height: 1.4;">
                        La página está descargando el archivo. Esto tardará dependiendo de la velocidad de tu internet. Una vez finalizada, se guardará automáticamente en tu dispositivo.
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 500;">
                            <span id="dialogStatusText">Conectando...</span>
                            <span id="dialogPercentText">0%</span>
                        </div>
                        <md-linear-progress id="downloadLinearProgress" indeterminate></md-linear-progress>
                    </div>
                </div>
                <div slot="actions">
                    <md-text-button id="dialogAcceptBtn">Aceptar</md-text-button>
                </div>
            </md-dialog>
        `;

        const dialog = wrapper.querySelector('#downloadProgressDialog');
        // Evitar que se cierre al hacer clic fuera del diálogo o presionar Escape
        dialog.addEventListener('cancel', (e) => {
            e.preventDefault();
        });

        const acceptBtn = wrapper.querySelector('#dialogAcceptBtn');
        acceptBtn.addEventListener('click', () => {
            dialog.close();
        });

        const typeChips = wrapper.querySelectorAll('.type-chip');
        typeChips.forEach(chip => {
            chip.addEventListener('click', () => {
                if (this.isDownloading) return;
                this.selectedType = chip.getAttribute('data-type');
                this.updateTypeSelectorUI(wrapper);
                this.populateFormatDropdowns(wrapper);
            });
        });

        const formatSelect = wrapper.querySelector('#formatSelect');
        const videoFormatSelect = wrapper.querySelector('#videoFormatSelect');
        const audioFormatSelect = wrapper.querySelector('#audioFormatSelect');

        formatSelect.addEventListener('input', () => this.checkDownloadButtonState(wrapper));
        videoFormatSelect.addEventListener('input', () => this.checkDownloadButtonState(wrapper));
        audioFormatSelect.addEventListener('input', () => this.checkDownloadButtonState(wrapper));

        wrapper.querySelector('#startDownloadBtn').addEventListener('click', () => {
            this.executeDownload(wrapper);
        });

        this.populateFormatDropdowns(wrapper);
    },

    updateTypeSelectorUI(wrapper) {
        const typeChips = wrapper.querySelectorAll('.type-chip');
        typeChips.forEach(chip => {
            if (chip.getAttribute('data-type') === this.selectedType) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        const audioSwitchContainer = wrapper.querySelector('#audioSwitchContainer');
        if (this.selectedType === 'audio_only') {
            audioSwitchContainer.style.display = 'flex';
        } else {
            audioSwitchContainer.style.display = 'none';
        }

        const singleSelectContainer = wrapper.querySelector('#singleSelectContainer');
        const fusionSelectContainer = wrapper.querySelector('#fusionSelectContainer');
        if (this.selectedType === 'fusion') {
            singleSelectContainer.classList.add('hidden-view');
            fusionSelectContainer.classList.remove('hidden-view');
        } else {
            singleSelectContainer.classList.remove('hidden-view');
            fusionSelectContainer.classList.add('hidden-view');
        }
    },

    getFormattedSize(f) {
        if (f.filesize_mb && f.filesize_mb !== 'Desconocido' && f.filesize_mb !== 'null') {
            return ` - ${f.filesize_mb}`;
        }
        if (f.filesize) {
            const mb = (f.filesize / (1024 * 1024)).toFixed(2);
            return ` - ${mb} MB`;
        }
        return '';
    },

    populateFormatDropdowns(wrapper) {
        const formatSelect = wrapper.querySelector('#formatSelect');
        const videoFormatSelect = wrapper.querySelector('#videoFormatSelect');
        const audioFormatSelect = wrapper.querySelector('#audioFormatSelect');

        this.checkDownloadButtonState(wrapper);

        if (this.selectedType === 'fusion') {
            videoFormatSelect.innerHTML = '<md-select-option value="" disabled selected></md-select-option>';
            const videoFormats = this.apiFormatsData.filter(f => f.type === 'video_only');
            videoFormats.forEach(f => {
                const opt = document.createElement('md-select-option');
                opt.value = f.format_id;
                const codecIndicator = this.getCodecInfo(f.vcodec);
                const label = `${f.resolution}${codecIndicator} [.${f.ext}]${this.getFormattedSize(f)}`;
                const div = document.createElement('div');
                div.slot = 'headline';
                div.textContent = label;
                opt.appendChild(div);
                videoFormatSelect.appendChild(opt);
            });

            audioFormatSelect.innerHTML = '<md-select-option value="" disabled selected></md-select-option>';
            const audioFormats = this.apiFormatsData.filter(f => f.type === 'audio_only');
            audioFormats.forEach(f => {
                const opt = document.createElement('md-select-option');
                opt.value = f.format_id;
                const bitrate = f.audio_bitrate ? f.audio_bitrate : 'Estándar';
                const label = `Audio (${bitrate}) [.${f.ext}]${this.getFormattedSize(f)}`;
                const div = document.createElement('div');
                div.slot = 'headline';
                div.textContent = label;
                opt.appendChild(div);
                audioFormatSelect.appendChild(opt);
            });
        } else {
            formatSelect.innerHTML = '<md-select-option value="" disabled selected></md-select-option>';
            const filteredFormats = this.apiFormatsData.filter(f => f.type === this.selectedType);
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
                    label = `Audio (${bitrate}) [.${f.ext}]${this.getFormattedSize(f)}`;
                } else {
                    const audioNote = f.audio_ext ? ` (${f.audio_ext})` : '';
                    const codecIndicator = this.getCodecInfo(f.vcodec);
                    label = `${f.resolution}${codecIndicator} [.${f.ext}]${audioNote}${this.getFormattedSize(f)}`;
                }
                const div = document.createElement('div');
                div.slot = 'headline';
                div.textContent = label;
                opt.appendChild(div);
                formatSelect.appendChild(opt);
            });
        }
    },

    checkDownloadButtonState(wrapper) {
        const startDownloadBtn = wrapper.querySelector('#startDownloadBtn');
        if (!startDownloadBtn) return;

        if (this.isDownloading) {
            startDownloadBtn.disabled = true;
            return;
        }

        const formatSelect = wrapper.querySelector('#formatSelect');
        const videoFormatSelect = wrapper.querySelector('#videoFormatSelect');
        const audioFormatSelect = wrapper.querySelector('#audioFormatSelect');

        if (this.selectedType === 'fusion') {
            if (videoFormatSelect && audioFormatSelect && videoFormatSelect.value && audioFormatSelect.value) {
                startDownloadBtn.disabled = false;
            } else {
                startDownloadBtn.disabled = true;
            }
        } else {
            if (formatSelect && formatSelect.value) {
                startDownloadBtn.disabled = false;
            } else {
                startDownloadBtn.disabled = true;
            }
        }
    },

    async executeDownload(wrapper) {
        if (!this.currentVideoUrl || this.isDownloading) return;

        this.isDownloading = true;
        this.checkDownloadButtonState(wrapper);
        history.pushState({ downloading: true }, '', window.location.href);

        const startDownloadBtn = wrapper.querySelector('#startDownloadBtn');
        const formatSelect = wrapper.querySelector('#formatSelect');
        const videoFormatSelect = wrapper.querySelector('#videoFormatSelect');
        const audioFormatSelect = wrapper.querySelector('#audioFormatSelect');
        const mp3Switch = wrapper.querySelector('#mp3Switch');

        const dialog = wrapper.querySelector('#downloadProgressDialog');
        const statusText = wrapper.querySelector('#dialogStatusText');
        const percentText = wrapper.querySelector('#dialogPercentText');
        const linearProgress = wrapper.querySelector('#downloadLinearProgress');

        const originalContent = startDownloadBtn.innerHTML;
        startDownloadBtn.innerHTML = `<i class="fa-solid fa-hourglass-half fa-spin" slot="icon"></i> Preparando...`;

        let downloadUrl = '';
        if (this.selectedType === 'fusion') {
            const videoFormatId = videoFormatSelect.value;
            const audioFormatId = audioFormatSelect.value;
            if (videoFormatId && audioFormatId) {
                downloadUrl = `https://api.samu330.com/yt/download?url=${encodeURIComponent(this.currentVideoUrl)}&format=${videoFormatId}+${audioFormatId}`;
            }
        } else {
            const formatId = formatSelect.value;
            if (formatId) {
                downloadUrl = `https://api.samu330.com/yt/download?url=${encodeURIComponent(this.currentVideoUrl)}&format=${formatId}`;
                if (this.selectedType === 'audio_only' && mp3Switch && mp3Switch.selected) {
                    downloadUrl += `&audio_format=mp3`;
                }
            }
        }

        if (!downloadUrl) {
            this.isDownloading = false;
            this.checkDownloadButtonState(wrapper);
            startDownloadBtn.innerHTML = originalContent;
            return;
        }

        // Temporizador de 15 segundos para cambiar textos si la descarga tarda en iniciar la transmisión
        let timeoutTriggered = false;
        const speedTimer = setTimeout(() => {
            timeoutTriggered = true;
            if (this.isDownloading) {
                if (startDownloadBtn) startDownloadBtn.innerHTML = `<i class="fa-solid fa-clock fa-spin" slot="icon"></i> Descarga segura...`;
                if (statusText) statusText.textContent = 'Proceso tardado, descarga segura...';
            }
        }, 15000);

        try {
            // Se realiza la petición. El diálogo se abrirá únicamente al recibir respuesta exitosa y empezar a procesar chunks.
            const response = await fetch(downloadUrl);

            if (!response.ok) {
                throw new Error('Error al procesar la descarga en el servidor.');
            }

            // AHORA SÍ: Abrir diálogo al iniciar la descarga real
            if (dialog) dialog.show();
            if (statusText) statusText.textContent = 'Iniciando descarga...';
            if (percentText) percentText.textContent = '0%';
            if (linearProgress) linearProgress.indeterminate = true;

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

            if (linearProgress) linearProgress.indeterminate = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                receivedLength += value.length;

                if (total > 0) {
                    const percent = Math.round((receivedLength / total) * 100);
                    if (startDownloadBtn) startDownloadBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-down fa-bounce" slot="icon"></i> Descargando: ${percent}%`;
                    if (percentText) percentText.textContent = `${percent}%`;
                    if (linearProgress) linearProgress.value = percent / 100;
                    if (statusText && !timeoutTriggered) statusText.textContent = `Descargando archivo... (${percent}%)`;
                } else {
                    const mbReceived = (receivedLength / (1024 * 1024)).toFixed(1);
                    if (startDownloadBtn) startDownloadBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-down fa-bounce" slot="icon"></i> Descargando... (${mbReceived} MB)`;
                    if (statusText && !timeoutTriggered) statusText.textContent = `Descargando... (${mbReceived} MB)`;
                }
            }

            clearTimeout(speedTimer);

            const blob = new Blob(chunks);
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);

            if (startDownloadBtn) startDownloadBtn.innerHTML = `<i class="fa-solid fa-circle-check" slot="icon"></i> ¡Completado!`;
            if (statusText) statusText.textContent = '¡Descarga completada y guardada en su dispositivo!';
            if (percentText) percentText.textContent = '100%';
            if (linearProgress) linearProgress.value = 1;

        } catch (error) {
            clearTimeout(speedTimer);
            console.error('Error en la descarga:', error);
            if (startDownloadBtn) startDownloadBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation" slot="icon"></i> Error`;
            if (dialog && !dialog.open) dialog.show();
            if (statusText) statusText.textContent = 'Ocurrió un error en el proceso de descarga.';
        } finally {
            this.isDownloading = false;
            setTimeout(() => {
                this.checkDownloadButtonState(wrapper);
                if (startDownloadBtn && !this.isDownloading) {
                    startDownloadBtn.innerHTML = originalContent;
                }
            }, 4000);
        }
    },

    getCodecInfo(vcodec = '') {
        if (!vcodec) return '';
        if (vcodec.toLowerCase().includes('avc1')) {
            return ' 🟢';
        }
        return ' ⚠️';
    },

    formatViews(views) {
        if (!views && views !== 0) return '0 vistas';
        return new Intl.NumberFormat('es-ES').format(views) + ' vistas';
    },

    goBack() {
        if (this.isDownloading) {
            this.showDownloadWarning();
            return;
        }
        this.dom.platformDetailsView.classList.add('hidden-view');
        if (this.currentNavigationSource === 'resultsView') {
            this.dom.resultsView.classList.remove('hidden-view');
        } else {
            this.dom.searchView.classList.remove('hidden-view');
        }
    },

    escapeHtml(text) {
        if (!text) return '';
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
};
