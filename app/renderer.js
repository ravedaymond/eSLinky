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
        },
        terminalShowHide: async () => {
            const contentTerminal = document.getElementsByClassName('content-terminal')[0];
            if(contentTerminal.classList.contains('app-hidden')) {
                contentTerminal.classList.remove('app-hidden');
                console.log("terminal visible");                
            } else {
                contentTerminal.classList.add('app-hidden');
                console.log("terminal hidden");
            }
        }
    }

    /*
    PAGINATION
    */
    static #paginationSetPageNumbersHTML(html) {
        const pager = document.getElementsByClassName('main-table-pager')[0];
        const pages = document.getElementsByClassName('table-pager-numbers')[0];
        if (html.length > 0) { pages.innerHTML = ''; }
        if (html.length <= 1) {
            pager.style.display = 'none';
        } else {
            pager.style.display = 'flex';
        }
        for (let i = 0; i < html.length; i++) {
            pages.innerHTML = pages.innerHTML + html[i];
        }
        pages.childNodes.forEach(child => {
            child.addEventListener('click', (event) => {
                Renderer.#onClick.pagerSelectAction(event, child.innerText);
            });
        });
    }

    static #paginationSetPageTableHTML(data) {
        const table = document.getElementsByClassName('main-table-data')[0];
        if (data.length > 0) { table.innerHTML = ''; }
        for (let i = 0; i < data.length; i++) {
            table.innerHTML = table.innerHTML + data[i];
        }
    }

    static #paginationSetActivePageCSS(page) {
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
            window.preload['complete']();
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
            // TODO Separate dock-terminal action call. Make purely UI.
            if (methodName === 'dockTerminal') {
                icon.addEventListener('click', (event) => {
                    Renderer.#onClick.terminalShowHide(event);
                });
            } else if (icon.classList.contains('pager-button')) {
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
