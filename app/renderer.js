class Renderer {
    
    static init() {
        Renderer.#versions();
        Renderer.#preloadHandler();
        Renderer.#listenersHandler();
        Renderer.#keybindsHandler();
    }

    /*
    KEYBINDINGS
    */
    static #keybindsHandler() {
        Renderer.#keybindsClearInputFocus();
        Renderer.#keybindsToggleTerminal();
    }

    static #keybindsClearInputFocus() {
        window.keybind.escape((event) => {
            document.querySelector(':focus').blur();
        });
    }

    static #keybindsToggleTerminal() {
        window.keybind.terminal((event) => {
            console.log('Toggle terminal keybind');
        });
    }

    /*
    LISTENERS
    */
    static #listenersHandler() {
        addEventListener('submit', (event) => {
            Renderer.#listenersSubmit(event);
        });
        addEventListener('focusout', (event) => {
            Renderer.#listenersFocusOut(event);
        });
    }

    static #listenersSubmit(event) {
        document.querySelector(':focus').blur();
        console.log('submit', event);
    }

    static #listenersFocusIn(event) {
        event.preventDefault();
        if (event.target.nodeName !== 'INPUT') { return; }
        console.log('focus in', event);
    }

    static #listenersFocusOut(event) {
        event.preventDefault();
        if (event.target.nodeName !== 'INPUT') { return; }
        if (event.target.type === 'text') {
            event.target.value = event.target.defaultValue;
        }
    }

    /*
    ON CLICK
    */
    static #onClick = {
        pagerArrowAction: async (event, methodName) => {
            const resp = await window.actions[methodName]();
            Renderer.#paginationSetPageTableHTML(resp.data);
            Renderer.#paginationSetActivePageCSS(resp.page);
        },
        pagerSelectAction: async (event, page) => {
            const resp = await window.actions.pagerSelect(page);
            Renderer.#paginationSetPageTableHTML(resp.data);
            Renderer.#paginationSetActivePageCSS(resp.page);
        }
    }

    /*
    PAGINATION
    */
    #paginationSetPageNumbersHTML(html) {
        const pager = document.getElementsByClassName('main-table-pager')[0];
        const pages = document.getElementsByClassName('table-pager-numbers')[0];
        if (pageHTML.length > 0) { pages.innerHTML = ''; }
        if (pageHTML.length <= 1) {
            pager.style.display = 'none';
        } else {
            pager.style.display = 'flex';
        }
        for (let i = 0; i < pageHTML.length; i++) {
            pages.innerHTML = pages.innerHTML + pageHTML[i];
        }
        pages.childNodes.forEach(child => {
            child.addEventListener('click', (event) => {
                Renderer.#onClick.pagerSelectAction(event, child.innerText);
            });
        });
    }

    #paginationSetPageTableHTML(table) {
        const data = document.getElementsByClassName('main-table-data')[0];
        if (tableData.length > 0) { data.innerHTML = ''; }
        for (let i = 0; i < tableData.length; i++) {
            data.innerHTML = data.innerHTML + tableData[i];
        }
    }

    #paginationSetActivePageCSS(page) {
        const prev = document.getElementById('pager-active');
        if (prev) {
            prev.removeAttribute('id');
        }
        document.getElementsByClassName('pager-number')[page].setAttribute('id', 'pager-active');
    }

    /*
    PRELOAD
    */
    static #preloadHandler() {
        if (Renderer.#preloadIcons() + Renderer.#preloadData()) {
            window.preload.complete();
        }
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
            const methodName = icon.getAttribute('icon-name');
            if (icon.classList.contains('pager-button')) {
                icon.addEventListener('click', (event) => {
                    Renderer.#onClick.pagerArrowAction(event, methodName);
                });
            } else {
                icon.addEventListener('click', (event) => {
                    window.actions[methodName]();
                });
            }
        }
        return true;
    }
    
    static async #preloadData() {
        const resp = await window.preload.data();
        Renderer.#paginationSetPageNumbersHTML(resp.pageHTML);
        Renderer.#paginationSetPageTableHTML(resp.tableData);
        Renderer.#paginationSetActivePageCSS(0);
        return true;
    }

    /*
    VERSIONS
    */
    static #versions() {
        const electronInfo = document.getElementById('versions');
        electronInfo.innerText = `Chrome (v${window.versions.chrome()}); Node.js (v${window.versions.node()}); Electron (v${window.versions.electron});`;
    }

    /*
    TEST
    */

}

Renderer.init();
