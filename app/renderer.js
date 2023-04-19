class Renderer {
    static init() {
        Renderer.#versions();
        Renderer.#preload();
        // window.preload['complete']();
    }

    static #versions() {
        const electronInfo = document.getElementById('versions');
        electronInfo.innerText = `Chrome (v${window.versions.chrome()}); Node.js (v${window.versions.node()}); Electron (v${window.versions.electron});`;
    }

    static #preload() {
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
            const methodName = icon.getAttribute('icon-name');
            if(icon.classList.contains('pager-button')) {
                icon.addEventListener('click', (event) => {
                    Renderer.#onClick.pagerArrowButton(event, methodName);
                });
            } else {
                icon.addEventListener('click', (event) => {
                    window.actions[methodName]();
                });
            }
        }
    }

    static async #preloadData() {
        const resp = await window.preload.data();
        Renderer.#populateTablePagerNumbers(resp.pageHTML);
        Renderer.#populateMainTableData(resp.tableData);
        Renderer.#updateCurrentPageNumber(0);
        return true;
    }

    static #populateTablePagerNumbers(pageHTML) {
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
                Renderer.#onClick.pagerNumberSelect(event, child.innerText);
            });
        });
    }

    static #updateCurrentPageNumber(page) {
        const prev = document.getElementById('pager-active');
        if (prev) {
            prev.removeAttribute('id');
        }
        document.getElementsByClassName('pager-number')[page].setAttribute('id', 'pager-active');
    }

    static #populateMainTableData(tableData) {
        const data = document.getElementsByClassName('main-table-data')[0];
        if (tableData.length > 0) { data.innerHTML = ''; }
        for (let i = 0; i < tableData.length; i++) {
            data.innerHTML = data.innerHTML + tableData[i];
        }
    }

    static #onClick = {
        pagerArrowButton: async (event, methodName) => {
            const resp = await window.actions[methodName]();
            Renderer.#populateMainTableData(resp.data);
            Renderer.#updateCurrentPageNumber(resp.page);
        },
        pagerNumberSelect: async (event, page) => {
            const resp = await window.actions.pagerSelect(page);
            Renderer.#populateMainTableData(resp.data);
            Renderer.#updateCurrentPageNumber(resp.page);
        }
    }

}

Renderer.init();
