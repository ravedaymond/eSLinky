class Renderer {
    static init() {
        Renderer.#versions();
        Renderer.#preload.icons();
        Renderer.#preload.data();
        // window.preload['complete']();
        addEventListener('submit', (event) => {
            event.preventDefault();
            Renderer.#formSubmit(event);
        });
        // addEventListener('focusin', (event) => {
        //     event.preventDefault();
        //     Renderer.#formFocusIn(event);
        // });
        addEventListener('focusout', (event) => {
            event.preventDefault();
            Renderer.#formFocusOut(event);
        });
    }

    static #versions() {
        const electronInfo = document.getElementById('versions');
        electronInfo.innerText = `Chrome (v${window.versions.chrome()}); Node.js (v${window.versions.node()}); Electron (v${window.versions.electron});`;
    }

    static #preload = {
        icons: async () => {
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
                if(icon.classList.contains('pager-button')) {
                    icon.addEventListener('click', (event) => {
                        Renderer.#onClick.pagerArrowAction(event, methodName);
                    });
                } else {
                    icon.addEventListener('click', (event) => {
                        window.actions[methodName]();
                    });
                }
            }
        },
        data: async () => {
            const resp = await window.preload.data();
            Renderer.#pagerUpdateAvailablePages(resp.pageHTML);
            Renderer.#dataPopulateMainTable(resp.tableData);
            Renderer.#pagerUpdateActivePageCSS(0);
        }
    }

    static #onClick = {
        pagerArrowAction: async (event, methodName) => {
            const resp = await window.actions[methodName]();
            Renderer.#dataPopulateMainTable(resp.data);
            Renderer.#pagerUpdateActivePageCSS(resp.page);
        },
        pagerSelectAction: async (event, page) => {
            const resp = await window.actions.pagerSelect(page);
            Renderer.#dataPopulateMainTable(resp.data);
            Renderer.#pagerUpdateActivePageCSS(resp.page);
        }
    }

    static #pagerUpdateAvailablePages(pageHTML) {
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

    static #pagerUpdateActivePageCSS(page) {
        const prev = document.getElementById('pager-active');
        if (prev) {
            prev.removeAttribute('id');
        }
        document.getElementsByClassName('pager-number')[page].setAttribute('id', 'pager-active');
    }

    static #dataPopulateMainTable(tableData) {
        const data = document.getElementsByClassName('main-table-data')[0];
        if (tableData.length > 0) { data.innerHTML = ''; }
        for (let i = 0; i < tableData.length; i++) {
            data.innerHTML = data.innerHTML + tableData[i];
        }
    }

    static #formSubmit(event) {
        console.log('form submit', event);
        // Lose focus of all events
    }

    static #formFocusIn(event) {
        if(event.target.nodeName !== 'INPUT') { return; }
        console.log('focus in', event);
    }

    static #formFocusOut(event) {
        if(event.target.nodeName !== 'INPUT') { return; }
        if(event.target.type === 'text') {
            event.target.value = event.target.defaultValue;
        }
    }

}

Renderer.init();
