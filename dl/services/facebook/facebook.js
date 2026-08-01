export const facebookPlatform = {
    regex: /(?:https?:\/\/)?(?:www\.|m\.|web\.)?(?:facebook\.com|fb\.watch)\/.+/i,

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
                        <p style="color: var(--md-sys-color-error);">No se pudo obtener contenido de este enlace de Facebook.</p>
                    </div>
                `;
                return;
            }

            const firstItem = json.data[0];
            const thumbnail = firstItem.thumbnail;
            const filename = firstItem.filename || 'facebook_video.mp4';

            const card = document.createElement('div');
            card.style.cssText = `
                background: var(--md-sys-color-surface-container-low);
                border: 1px solid var(--md-sys-color-outline-variant);
                border-radius: 20px;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin-bottom: 16px;
            `;

            card.innerHTML = `
                <div style="position: relative; width: 100%; height: 320px; border-radius: 12px; overflow: hidden; background: var(--md-sys-color-surface-variant);">
                    <img src="${thumbnail}" alt="Thumbnail de Facebook" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    <div style="position: absolute; top: 12px; left: 12px; background: rgba(0, 0, 0, 0.75); color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(4px);">
                        <i class="fa-brands fa-facebook"></i> Video de Facebook
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant); word-break: break-all;">
                        <strong>Archivo:</strong> ${filename}
                    </span>
                    <span style="font-size: 0.8rem; color: var(--md-sys-color-primary); font-weight: 500; margin-top: 4px;">
                        Selecciona la calidad de descarga:
                    </span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;" id="resolutionsContainer"></div>
            `;

            const resolutionsContainer = card.querySelector('#resolutionsContainer');

            json.data.forEach((item, index) => {
                const resolutionText = item.resolution || `Calidad #${index + 1}`;
                
                const btn = document.createElement('md-filled-button');
                btn.style.width = '100%';
                btn.innerHTML = `<i class="fa-solid fa-download" slot="icon"></i> Descargar en ${resolutionText}`;
                
                let downloadUrl = item.url;
                if (downloadUrl.startsWith('/')) {
                    downloadUrl = `https://d.rapidcdn.app${downloadUrl}`;
                }

                btn.addEventListener('click', async () => {
                    try {
                        btn.disabled = true;
                        btn.textContent = 'Descargando...';

                        const res = await fetch(downloadUrl);
                        const blob = await res.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = item.filename || 'facebook-video.mp4';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(blobUrl);

                        btn.disabled = false;
                        btn.innerHTML = `<i class="fa-solid fa-download" slot="icon"></i> Descargar en ${resolutionText}`;
                    } catch (err) {
                        console.error('Error al descargar:', err);
                        window.open(downloadUrl, '_blank');
                        btn.disabled = false;
                        btn.innerHTML = `<i class="fa-solid fa-download" slot="icon"></i> Descargar en ${resolutionText}`;
                    }
                });

                resolutionsContainer.appendChild(btn);
            });

            resultsContainer.appendChild(card);

        } catch (error) {
            console.error('Error de red:', error);
            loadingIndicator.classList.add('hidden-view');
            resultsContainer.classList.remove('hidden-view');
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 24px;">
                    <p style="color: var(--md-sys-color-error);">Error de red al conectar con la API de Facebook.</p>
                </div>
            `;
        }
    }
};
