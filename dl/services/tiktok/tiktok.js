export const tiktokPlatform = {
    regex: /(?:https?:\/\/)?(?:www\.|m\.|web\.)?(?:tiktok\.com|vm\.tiktok\.com)\/.+/i,

    init(dom) {
        this.dom = dom;

        if (!window._mediaMutexInitialized) {
            window._mediaMutexInitialized = true;
            document.addEventListener('play', (e) => {
                const target = e.target;
                if (target && (target.tagName === 'VIDEO' || target.tagName === 'AUDIO')) {
                    if (window._currentActiveMedia && window._currentActiveMedia !== target) {
                        window._currentActiveMedia.pause();
                    }
                    window._currentActiveMedia = target;
                }
            }, true);
        }
    },

    formatNumber(num) {
        if (!num) return '0';
        const n = parseInt(num, 10);
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    },

    formatDuration(seconds) {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },

    formatSize(bytes) {
        if (!bytes) return '';
        if (bytes >= 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
        return (bytes / 1024).toFixed(1) + ' KB';
    },

    // --- BÚSQUEDA ---
    async handleSearchAction(keywords) {
        const { searchView, resultsView, loadingIndicator, resultsContainer, queryLabel } = this.dom;

        document.getElementById('searchView').classList.add('hidden-view');
        resultsView.classList.remove('hidden-view');

        queryLabel.textContent = `Búsqueda TikTok: "${keywords}"`;
        loadingIndicator.classList.remove('hidden-view');
        resultsContainer.classList.add('hidden-view');
        resultsContainer.innerHTML = '';

        let currentCursor = 0;
        let hasMoreData = true;

        const contentWrapper = document.createElement('div');
        contentWrapper.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';
        resultsContainer.appendChild(contentWrapper);

        const fetchResults = async (cursor) => {
            try {
                const res = await fetch(`https://api.samu330.com/tiktok/search?keywords=${encodeURIComponent(keywords)}&count=10&cursor=${cursor}`);
                const json = await res.json();

                loadingIndicator.classList.add('hidden-view');
                resultsContainer.classList.remove('hidden-view');

                if (!json.status || !json.data || !json.data.videos || json.data.videos.length === 0) {
                    if (cursor === 0) {
                        contentWrapper.innerHTML = `
                            <div style="text-align: center; padding: 24px;">
                                <p style="color: var(--md-sys-color-error);">${json.msg || 'No se encontraron resultados.'}</p>
                            </div>
                        `;
                    }
                    return false;
                }

                hasMoreData = json.data.hasMore;
                currentCursor = json.data.cursor;

                json.data.videos.forEach(video => {
                    const card = document.createElement('div');
                    card.style.cssText = `
                        background: var(--md-sys-color-surface-container-low);
                        border: 1px solid var(--md-sys-color-outline-variant);
                        border-radius: 20px;
                        padding: 16px;
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    `;

                    const author = video.author || {};
                    const musicInfo = video.music_info || {};
                    const thumbnail = video.ai_dynamic_cover || video.cover || '';
                    const audioUrl = musicInfo.url || musicInfo.play || '';

                    card.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--md-sys-color-surface-variant); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
                                <img src="${author.avatar || ''}" alt="Avatar" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <i class="fa-solid fa-user" style="display: none; color: var(--md-sys-color-on-surface-variant); font-size: 0.9rem;"></i>
                            </div>
                            <div style="display: flex; flex-direction: column; overflow: hidden;">
                                <span style="font-weight: 600; font-size: 0.95rem; color: var(--md-sys-color-on-surface); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${author.nickname || 'Usuario'}</span>
                                <span style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant);">@${author.unique_id || 'user'}</span>
                            </div>
                        </div>

                        <p style="font-size: 0.9rem; color: var(--md-sys-color-on-surface); margin: 0; line-height: 1.4;">${video.title || ''}</p>
                        
                        <div style="position: relative; width: 100%; border-radius: 12px; overflow: hidden; background: #000; border: 1px solid var(--md-sys-color-outline-variant);">
                            <video controls preload="metadata" poster="${thumbnail}" style="width: 100%; max-height: 420px; display: block; object-fit: contain;">
                                <source src="${video.play}" type="video/mp4">
                                Tu navegador no soporta la reproducción de video.
                            </video>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 8px; background: var(--md-sys-color-surface); padding: 12px; border-radius: 12px; border: 1px solid var(--md-sys-color-outline-variant);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--md-sys-color-primary-container); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; color: var(--md-sys-color-on-primary-container);">
                                    <img src="${musicInfo.cover || ''}" alt="Cover" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                    <i class="fa-solid fa-music" style="display: ${musicInfo.cover ? 'none' : 'flex'}; font-size: 0.9rem;"></i>
                                </div>
                                <div style="display: flex; flex-direction: column; overflow: hidden; flex-grow: 1;">
                                    <span style="font-size: 0.8rem; font-weight: 600; color: var(--md-sys-color-on-surface); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${musicInfo.title || 'Audio original'}</span>
                                    <span style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${musicInfo.author || author.nickname || 'Artista'}</span>
                                </div>
                            </div>
                            
                            ${audioUrl ? `
                                <audio class="managed-audio" controls preload="none" style="width: 100%; height: 36px; border-radius: 6px;">
                                    <source src="${audioUrl}" type="audio/mp3">
                                    Tu navegador no soporta audio.
                                </audio>
                            ` : ''}
                        </div>

                        <div style="display: flex; justify-content: space-around; font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); background: var(--md-sys-color-surface-variant); padding: 8px; border-radius: 10px;">
                            <span><i class="fa-solid fa-eye"></i> ${this.formatNumber(video.play_count)}</span>
                            <span><i class="fa-solid fa-heart"></i> ${this.formatNumber(video.digg_count)}</span>
                            <span><i class="fa-solid fa-comment"></i> ${this.formatNumber(video.comment_count)}</span>
                            <span><i class="fa-solid fa-share"></i> ${this.formatNumber(video.share_count)}</span>
                        </div>
                    `;

                    contentWrapper.appendChild(card);
                });

                return true;
            } catch (err) {
                loadingIndicator.classList.add('hidden-view');
                resultsContainer.classList.remove('hidden-view');
                return false;
            }
        };

        await fetchResults(currentCursor);

        let loadMoreBtnContainer = document.createElement('div');
        loadMoreBtnContainer.style.cssText = 'display: flex; justify-content: center; margin-top: 12px; margin-bottom: 24px;';
        
        const updateLoadMoreButton = () => {
            loadMoreBtnContainer.innerHTML = '';
            if (hasMoreData) {
                const loadMoreBtn = document.createElement('md-filled-button');
                loadMoreBtn.innerHTML = `Mostrar más resultados <i class="fa-solid fa-chevron-down" slot="icon"></i>`;
                loadMoreBtn.addEventListener('click', async () => {
                    loadMoreBtn.disabled = true;
                    loadMoreBtn.textContent = 'Cargando...';
                    const success = await fetchResults(currentCursor);
                    if (success && hasMoreData) {
                        loadMoreBtn.disabled = false;
                        loadMoreBtn.innerHTML = `Mostrar más resultados <i class="fa-solid fa-chevron-down" slot="icon"></i>`;
                    } else {
                        loadMoreBtnContainer.remove();
                    }
                });
                loadMoreBtnContainer.appendChild(loadMoreBtn);
                resultsContainer.appendChild(loadMoreBtnContainer);
            }
        };
        updateLoadMoreButton();
    },

    // --- DESCARGA ---
    async handleDownloadAction(url, originViewId) {
        const { searchView, resultsView, loadingIndicator, resultsContainer, queryLabel } = this.dom;

        document.getElementById(originViewId).classList.add('hidden-view');
        resultsView.classList.remove('hidden-view');

        queryLabel.textContent = url;
        loadingIndicator.classList.remove('hidden-view');
        resultsContainer.classList.add('hidden-view');
        resultsContainer.innerHTML = '';

        try {
            const response = await fetch(`https://api.samu330.com/tiktok/download?url=${encodeURIComponent(url)}`);
            const json = await response.json();

            loadingIndicator.classList.add('hidden-view');
            resultsContainer.classList.remove('hidden-view');

            if (!json.status || !json.data) {
                resultsContainer.innerHTML = `
                    <div style="text-align: center; padding: 24px;">
                        <p style="color: var(--md-sys-color-error);">${json.msg || 'No se pudo procesar el enlace.'}</p>
                    </div>
                `;
                return;
            }

            const data = json.data;
            const isImageCarousel = data.images && data.images.length > 0;

            const card = document.createElement('div');
            card.style.cssText = `
                background: var(--md-sys-color-surface-container-low);
                border: 1px solid var(--md-sys-color-outline-variant);
                border-radius: 20px;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            `;

            let mediaPreviewHTML = '';

            if (isImageCarousel) {
                mediaPreviewHTML = `
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-top: 4px;">
                        ${data.images.map((imgUrl, idx) => {
                            const dlItem = (data.downloads && data.downloads.find(d => d.type === 'image' && d.text && d.text.includes(`${idx + 1}`))) || (data.downloads && data.downloads[idx]) || { url: imgUrl, text: `Imagen ${idx + 1}` };
                            return `
                                <div style="display: flex; flex-direction: column; gap: 8px; background: var(--md-sys-color-surface-variant); padding: 8px; border-radius: 12px; border: 1px solid var(--md-sys-color-outline-variant);">
                                    <div style="position: relative; width: 100%; border-radius: 8px; overflow: hidden; background: #000; aspect-ratio: 3/4;">
                                        <img src="${imgUrl}" alt="Imagen ${idx + 1}" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.style.display='none';">
                                    </div>
                                    <md-filled-button class="single-dl-btn" data-url="${dlItem.url}" data-name="samu330.com_tiktok_${data.id}_img_${idx + 1}.jpg" style="width: 100%; font-size: 0.75rem;">
                                        <i class="fa-solid fa-download" slot="icon"></i> Descargar
                                    </md-filled-button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                const videoThumbnail = data.thumbnail || '';
                mediaPreviewHTML = `
                    <div style="position: relative; width: 100%; border-radius: 12px; overflow: hidden; background: #000;">
                        <img src="${videoThumbnail}" alt="Thumbnail" style="width: 100%; max-height: 450px; display: block; object-fit: contain;">
                    </div>
                `;

            const stats = data.stats || {};

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--md-sys-color-surface-variant); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
                        <img src="${data.authorAvatar || ''}" alt="Avatar" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <i class="fa-solid fa-user" style="display: none; color: var(--md-sys-color-on-surface-variant); font-size: 1rem;"></i>
                    </div>
                    <div style="display: flex; flex-direction: column; overflow: hidden;">
                        <span style="font-weight: 600; font-size: 1rem; color: var(--md-sys-color-on-surface);">${data.author || 'Usuario TikTok'}</span>
                        <span style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant);">@${data.uniqueId || 'tiktok_user'}</span>
                    </div>
                </div>

                ${data.description ? `<p style="font-size: 0.9rem; color: var(--md-sys-color-on-surface); margin: 0; line-height: 1.4;">${data.description}</p>` : ''}

                ${mediaPreviewHTML}

                <div style="display: flex; justify-content: space-around; font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); background: var(--md-sys-color-surface-variant); padding: 8px; border-radius: 10px;">
                    <span><i class="fa-solid fa-clock"></i> ${this.formatDuration(data.duration)}</span>
                    <span><i class="fa-solid fa-eye"></i> ${this.formatNumber(stats.views)}</span>
                    <span><i class="fa-solid fa-heart"></i> ${this.formatNumber(stats.likes)}</span>
                    <span><i class="fa-solid fa-comment"></i> ${this.formatNumber(stats.comments)}</span>
                </div>

                <span style="font-size: 0.85rem; color: var(--md-sys-color-primary); font-weight: 500;">Opciones de descarga:</span>
                <div style="display: flex; flex-direction: column; gap: 8px;" id="downloadsContainer"></div>
            `;

            card.querySelectorAll('.single-dl-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const dlUrl = btn.getAttribute('data-url');
                    const fileName = btn.getAttribute('data-name');
                    try {
                        btn.disabled = true;
                        btn.textContent = 'Descargando...';
                        const fileRes = await fetch(dlUrl);
                        const blob = await fileRes.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(blobUrl);
                        btn.disabled = false;
                        btn.innerHTML = `<i class="fa-solid fa-download" slot="icon"></i> Descargar`;
                    } catch (e) {
                        window.open(dlUrl, '_blank');
                        btn.disabled = false;
                        btn.innerHTML = `<i class="fa-solid fa-download" slot="icon"></i> Descargar`;
                    }
                });
            });

            const downloadsContainer = card.querySelector('#downloadsContainer');

            if (data.downloads && data.downloads.length > 0) {
                data.downloads.forEach(dl => {
                    if (isImageCarousel && dl.type === 'image') return;

                    const btn = document.createElement('md-filled-button');
                    btn.style.width = '100%';
                    
                    let iconClass = 'fa-download';
                    if (dl.type === 'audio') iconClass = 'fa-music';

                    const sizeText = dl.size ? ` (${this.formatSize(dl.size)})` : '';
                    btn.innerHTML = `<i class="fa-solid ${iconClass}" slot="icon"></i> ${dl.text || 'Descargar'}${sizeText}`;

                    btn.addEventListener('click', async () => {
                        try {
                            btn.disabled = true;
                            btn.textContent = 'Descargando...';
                            const fileRes = await fetch(dl.url);
                            const blob = await fileRes.blob();
                            const blobUrl = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = blobUrl;
                            a.download = `samu330.com_tiktok_${data.id || 'media'}.${dl.type === 'audio' ? 'mp3' : 'mp4'}`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(blobUrl);
                            btn.disabled = false;
                            btn.innerHTML = `<i class="fa-solid ${iconClass}" slot="icon"></i> ${dl.text || 'Descargar'}${sizeText}`;
                        } catch (e) {
                            window.open(dl.url, '_blank');
                            btn.disabled = false;
                            btn.innerHTML = `<i class="fa-solid ${iconClass}" slot="icon"></i> ${dl.text || 'Descargar'}${sizeText}`;
                        }
                    });

                    downloadsContainer.appendChild(btn);
                });
            }

            resultsContainer.appendChild(card);

        } catch(err) {
            loadingIndicator.classList.add('hidden-view');
            resultsContainer.classList.remove('hidden-view');
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 24px;">
                    <p style="color: var(--md-sys-color-error);">Error de red al conectar con la API de TikTok.</p>
                </div>
            `;
        }
    }
};
