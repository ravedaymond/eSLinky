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
        const icons = document.getElementsByClassName('icon-button');
        let req = [];
        for (let i = 0; i < icons.length; i++) {
            req.push(icons[i].getAttribute('icon-name'));
        }
        const resp = await window.preload.icons(req);
        for (let i = 0; i < icons.length; i++) {
            const icon = icons[i];
            icon.innerHTML = resp[i];
            icon.addEventListener('click', () => {
                window.buttons[icon.getAttribute('icon-name')]();
            });
        }
    }

}

Renderer.init();