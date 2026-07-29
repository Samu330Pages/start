export const instagramPlatform = {
    regex: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:(?:p|reel|tv|stories)\/[a-zA-Z0-9_-]+|([a-zA-Z0-9_.-]+))\/?(?:\?.*)?$/i,

    init(dom) {
        this.dom = dom;
    },

    async handleDownloadAction(url, originViewId) {
        const { searchView, resultsView, loadingIndicator, resultsContainer, queryLabel } = this.dom;

        document.getElementById(originViewId).classList.add('hidden-view');
        resultsView.classList.remove('hidden-view');

        queryLabel.textContent = url;
        loadingIndicator.classList.remove('hidden-view');
        resultsContainer.classList.add('hidden-view');
        resultsContainer.innerHTML = '';

        try {
            const response = await fetch(`https://api.samu330.com/fb-ig/dl?url=${encodeURIComponent(url)}`);
            const json = await response.json();

            loadingIndicator.classList.add('hidden-view');
            resultsContainer.classList.remove('hidden-view');

            if (!json.status || !json.data || json.data.length === 0) {
                resultsContainer.innerHTML = `
                    <div style="text-align: center; padding: 24px;">
                        <p style="color: var(--md-sys-color-error);">No se pudo obtener contenido de este enlace.</p>
                    </div>
                `;
                return;
            }

            json.data.forEach((item, index) => {
                const isVideo = item.type === 'video';
                const badgeText = isVideo ? 'Video' : 'Foto';
                const badgeIcon = isVideo ? 'fa-solid fa-video' : 'fa-solid fa-image';
                const downloadText = isVideo ? 'Descargar Video' : 'Descargar Foto';

                const card = document.createElement('div');
                card.style.cssText = `
                    background: var(--md-sys-color-surface-container-low);
                    border: 1px solid var(--md-sys-color-outline-variant);
                    border-radius: 20px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    margin-bottom: 16px;
                `;

                card.innerHTML = `
                    <div style="position: relative; width: 100%; height: 320px; border-radius: 12px; overflow: hidden; background: var(--md-sys-color-surface-variant);">
                        <img src="${item.thumbnail}" alt="Thumbnail" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                        <div style="position: absolute; top: 12px; left: 12px; background: rgba(0, 0, 0, 0.75); color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(4px);">
                            <i class="${badgeIcon}"></i> ${badgeText} (#${index + 1})
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); word-break: break-all; opacity: 0.8;">
                            <strong>Archivo:</strong> ${item.filename || 'instagram_media'}
                        </span>
                    </div>
                    <md-filled-button class="ig-download-btn" data-url="${item.url}" style="width: 100%;">
                        <i class="fa-solid fa-download" slot="icon"></i> ${downloadText}
                    </md-filled-button>
                `;

                const downloadBtn = card.querySelector('.ig-download-btn');
                downloadBtn.addEventListener('click', async () => {
                    const mediaUrl = downloadBtn.getAttribute('data-url');
                    try {
                        downloadBtn.disabled = true;
                        downloadBtn.textContent = 'Descargando...';

                        const res = await fetch(mediaUrl);
                        const blob = await res.blob();
                        const blobUrl = window.URL.createObjectURL(blob);

                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = item.filename || (isVideo ? 'instagram-video.mp4' : 'instagram-image.jpg');
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(blobUrl);

                        downloadBtn.disabled = false;
                        downloadBtn.innerHTML = `<i class="fa-solid fa-download" slot="icon"></i> ${downloadText}`;
                    } catch (err) {
                        console.error('Error al descargar:', err);
                        window.open(mediaUrl, '_blank');
                        downloadBtn.disabled = false;
                        downloadBtn.innerHTML = `<i class="fa-solid fa-download" slot="icon"></i> ${downloadText}`;
                    }
                });

                resultsContainer.appendChild(card);
            });

        } catch (error) {
            console.error('Error de red:', error);
            loadingIndicator.classList.add('hidden-view');
            resultsContainer.classList.remove('hidden-view');
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 24px;">
                    <p style="color: var(--md-sys-color-error);">Error de red al conectar con la API de Instagram.</p>
                </div>
            `;
        }
    }
};
