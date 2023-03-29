class Renderer {
    static init() {
        Renderer.#versions();
        Renderer.#preload();
    }

    static #versions() {
        const electronInfo = document.getElementById('versions');
        electronInfo.innerText = `Chrome (v${window.versions.chrome()}); Node.js (v${window.versions.node()}); Electron (v${window.versions.electron});`;
    }
    
    static async #preload() {
        Renderer.#preloadIcons();
        Renderer.#preloadData();
    }

    static async #preloadIcons() {
        const icons = document.getElementsByClassName('lucide-icon');
        let req = [];
        for (let i = 0; i < icons.length; i++) {
            req.push(icons[i].getAttribute('icon-name'));
        }
        const resp = await window.preload.icons(req);
        for (let i = 0; i < icons.length; i++) {
            const icon = icons[i];
            icon.innerHTML = resp[i];
            icon.addEventListener('click', () => {
                window.actions[icon.getAttribute('icon-name')]();
            });
        }
    }

    static async #preloadData() {
        const data = document.getElementsByClassName('table-data')[0];
        const resp = await window.preload.data();
        for(let i = 0; i < resp.length; i++) {
            data.innerHTML = data.innerHTML+resp[i];
        }
    }
}

Renderer.init();
