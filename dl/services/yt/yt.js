export const youtubePlatform = {
    id: 'youtube',
    name: 'YouTube',
    regex: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i,
    supportsSearch: true,

    dom: {},
    apiFormatsData: [],
    selectedType: 'mixed', // Cambiado a mixed por defecto según la nueva API
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
                // Adaptado para recolectar mixed y estructurar las opciones
                this.apiFormatsData = data.formats?.mixed || [];
                this.selectedType = 'mixed';
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
        // Formatear duración de segundos a MM:SS o HH:MM:SS
        const formatDuration = (sec) => {
            if (!sec) return '00:00';
            const hrs = Math.floor(sec / 3600);
            const mins = Math.floor((sec % 3600) / 60);
            const secs = sec % 60;
            if (hrs > 0) {
                return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
            }
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        };

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
                            <strong id="infoChannel" style="cursor: pointer; color: var(--md-sys-color-primary); text-decoration: underline;" title="Ver canal">
                                ${this.escapeHtml(meta.channel)} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.75rem;"></i>
                            </strong>
                        </span>
                        <span>
                            <i class="fa-solid fa-clock"></i>
                            <span id="infoDuration">${formatDuration(meta.duration_seconds)}</span>
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

            <!-- Chips de Material 3 para Categorías y Tags -->
            <div style="margin: 12px 0; display: flex; flex-direction: column; gap: 8px;">
                ${meta.categories && meta.categories.length > 0 ? `
                    <div style="font-size: 0.85rem; font-weight: 500; color: var(--md-sys-color-on-surface-variant);">Categorías:</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;" id="categoriesChipsContainer">
                        ${meta.categories.map(cat => `<md-filter-chip label="${this.escapeHtml(cat)}" class="search-trigger-chip" data-query="${this.escapeHtml(cat)}"></md-filter-chip>`).join('')}
                    </div>
                ` : ''}
                ${meta.tags && meta.tags.length > 0 ? `
                    <div style="font-size: 0.85rem; font-weight: 500; color: var(--md-sys-color-on-surface-variant); margin-top: 4px;">Etiquetas:</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;" id="tagsChipsContainer">
                        ${meta.tags.map(tag => `<md-suggestion-chip label="${this.escapeHtml(tag)}" class="search-trigger-chip" data-query="${this.escapeHtml(tag)}"></md-suggestion-chip>`).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="download-options-card">
                <h4 class="options-title">
                    <i class="fa-solid fa-sliders"></i> Opciones de Descarga
                </h4>

                <!-- Botón rápido para descargar Audio M4A -->
                <div style="margin-bottom: 16px;">
                    <md-filled-tonal-button id="downloadAudioBtn" style="width: 100%;">
                        <i class="fa-solid fa-music" slot="icon"></i>
                        Descargar Audio (M4A)
                    </md-filled-tonal-button>
                </div>

                <div class="codec-info-banner" style="margin: 12px 0; padding: 12px; border-radius: 8px; background: var(--md-sys-color-surface-container-low, #f1f3f4); font-size: 0.8rem; display: flex; flex-direction: column; gap: 6px;">
                    <div style="font-weight: 500; display: flex; align-items: center; gap: 6px; color: var(--md-sys-color-primary);">
                        <i class="fa-solid fa-circle-info"></i>
                        <span>Guía de Calidades y Códecs</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-circle-check" style="color: #2e7d32;"></i>
                        <span><strong>AVC1:</strong> Máxima compatibilidad con cualquier dispositivo o reproductor.</span>
                    </div>
                </div>

                <div id="singleSelectContainer">
                    <md-outlined-select id="formatSelect" label="Calidad de Vídeo Disponible">
                        <md-select-option value="" disabled selected></md-select-option>
                    </md-outlined-select>
                </div>
                
                <md-filled-button id="startDownloadBtn" disabled style="width: 100%; margin-top: 12px;">
                    <i class="fa-solid fa-download" slot="icon"></i> Descargar Vídeo Seleccionado
                </md-filled-button>
            </div>

            <!-- Diálogo Material Web nativo con barra de progreso -->
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

        // Evento para abrir el canal en una nueva pestaña si existe channel_url
        const channelEl = wrapper.querySelector('#infoChannel');
        if (meta.channel_url) {
            channelEl.addEventListener('click', () => {
                window.open(meta.channel_url, '_blank');
            });
        }

        // Evento para los chips de búsqueda de categorías y tags
        wrapper.querySelectorAll('.search-trigger-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.getAttribute('data-query');
                if (query) {
                    this.dom.platformDetailsView.classList.add('hidden-view');
                    this.executeSearch(query);
                }
            });
        });

        // Botón directo de descarga de audio
        wrapper.querySelector('#downloadAudioBtn').addEventListener('click', () => {
            this.executeDirectAudioDownload(wrapper);
        });

        const dialog = wrapper.querySelector('#downloadProgressDialog');
        dialog.addEventListener('cancel', (e) => {
            e.preventDefault();
        });

        const acceptBtn = wrapper.querySelector('#dialogAcceptBtn');
        acceptBtn.addEventListener('click', () => {
            dialog.close();
        });

        const formatSelect = wrapper.querySelector('#formatSelect');
        formatSelect.addEventListener('input', () => this.checkDownloadButtonState(wrapper));

        wrapper.querySelector('#startDownloadBtn').addEventListener('click', () => {
            this.executeDownload(wrapper);
        });

        this.populateFormatDropdowns(wrapper);
    },

    populateFormatDropdowns(wrapper) {
        const formatSelect = wrapper.querySelector('#formatSelect');
        this.checkDownloadButtonState(wrapper);

        formatSelect.innerHTML = '<md-select-option value="" disabled selected></md-select-option>';
        
        if (this.apiFormatsData.length === 0) {
            const opt = document.createElement('md-select-option');
            opt.disabled = true;
            const div = document.createElement('div');
            div.slot = 'headline';
            div.textContent = 'No hay formatos disponibles';
            opt.appendChild(div);
            formatSelect.appendChild(opt);
            return;
        }

        this.apiFormatsData.forEach(f => {
            const opt = document.createElement('md-select-option');
            opt.value = f.format_id;
            const sizeText = f.size ? ` - ${f.size}` : '';
            const label = `Resolución: ${f.quality} [.${f.ext}]${sizeText}`;
            
            const div = document.createElement('div');
            div.slot = 'headline';
            div.textContent = label;
            opt.appendChild(div);
            formatSelect.appendChild(opt);
        });
    },

    checkDownloadButtonState(wrapper) {
        const startDownloadBtn = wrapper.querySelector('#startDownloadBtn');
        if (!startDownloadBtn) return;

        if (this.isDownloading) {
            startDownloadBtn.disabled = true;
            return;
        }

        const formatSelect = wrapper.querySelector('#formatSelect');
        if (formatSelect && formatSelect.value) {
            startDownloadBtn.disabled = false;
        } else {
            startDownloadBtn.disabled = true;
        }
    },

    async executeDirectAudioDownload(wrapper) {
        if (!this.currentVideoUrl || this.isDownloading) return;
        const audioUrl = `https://api.samu330.com/yt/download?url=${encodeURIComponent(this.currentVideoUrl)}&type=audio`;
        this.processFileDownload(wrapper, audioUrl);
    },

    async executeDownload(wrapper) {
        if (!this.currentVideoUrl || this.isDownloading) return;

        const formatSelect = wrapper.querySelector('#formatSelect');
        const formatId = formatSelect.value;
        if (!formatId) return;

        // Lógica de descarga intacta usando format_id
        const downloadUrl = `https://api.samu330.com/yt/download?url=${encodeURIComponent(this.currentVideoUrl)}&format=${formatId}`;
        this.processFileDownload(wrapper, downloadUrl);
    },

    async processFileDownload(wrapper, downloadUrl) {
        this.isDownloading = true;
        this.checkDownloadButtonState(wrapper);
        history.pushState({ downloading: true }, '', window.location.href);

        const startDownloadBtn = wrapper.querySelector('#startDownloadBtn');
        const dialog = wrapper.querySelector('#downloadProgressDialog');
        const statusText = wrapper.querySelector('#dialogStatusText');
        const percentText = wrapper.querySelector('#dialogPercentText');
        const linearProgress = wrapper.querySelector('#downloadLinearProgress');

        let timeoutTriggered = false;
        const speedTimer = setTimeout(() => {
            timeoutTriggered = true;
            if (this.isDownloading) {
                if (statusText) statusText.textContent = 'Proceso tardado, descarga segura...';
            }
        }, 15000);

        try {
            const response = await fetch(downloadUrl);
            if (!response.ok) {
                throw new Error('Error al procesar la descarga en el servidor.');
            }

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
                    if (percentText) percentText.textContent = `${percent}%`;
                    if (linearProgress) linearProgress.value = percent / 100;
                    if (statusText && !timeoutTriggered) statusText.textContent = `Descargando archivo... (${percent}%)`;
                } else {
                    const mbReceived = (receivedLength / (1024 * 1024)).toFixed(1);
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

            if (statusText) statusText.textContent = '¡Descarga completada y guardada en su dispositivo!';
            if (percentText) percentText.textContent = '100%';
            if (linearProgress) linearProgress.value = 1;

        } catch (error) {
            clearTimeout(speedTimer);
            console.error('Error en la descarga:', error);
            if (dialog && !dialog.open) dialog.show();
            if (statusText) statusText.textContent = 'Ocurrió un error en el proceso de descarga.';
        } finally {
            this.isDownloading = false;
            this.checkDownloadButtonState(wrapper);
        }
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
