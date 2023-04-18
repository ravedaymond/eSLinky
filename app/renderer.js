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
            icon.addEventListener('click', (event) => {
                const methodName = icon.getAttribute('icon-name');
                if (Renderer.#onClick.hasOwnProperty(methodName)) {
                    // Handle click event method
                    Renderer.#onClick[methodName](event, methodName);
                } else {
                    // Pass through click action to main
                    window.actions[methodName]();
                }
            });
        }
    }

    static async #preloadData() {
        const resp = await window.preload.data();
        Renderer.#populateTablePagerNumbers(resp.pageHTML);
        Renderer.#populateMainTableData(resp.tableData);
        Renderer.#updateCurrentPageNumber(0);
    }

    static #populateTablePagerNumbers(pageHTML) {
        const pages = document.getElementsByClassName('table-pager-numbers')[0];
        for (let i = 0; i < pageHTML.length; i++) {
            pages.innerHTML = pages.innerHTML + pageHTML[i];
        }
    }

    static #updateCurrentPageNumber(page) {
        const prev = document.getElementById('pager-active');
        if(prev) {
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
        pagerFirst: async (event, methodName) => {
            const resp = await window.actions[methodName]();
            console.log(resp);
            Renderer.#populateMainTableData(resp.data);
            Renderer.#updateCurrentPageNumber(resp.page);
        },
        pagerPrevious: async (event, methodName) => {
            const resp = await window.actions[methodName]();
            Renderer.#populateMainTableData(resp.data);
            Renderer.#updateCurrentPageNumber(resp.page);
        },
        pagerNext: async (event, methodName) => {
            const resp = await window.actions[methodName]();
            Renderer.#populateMainTableData(resp.data);
            Renderer.#updateCurrentPageNumber(resp.page);
        },
        pagerLast: async (event, methodName) => {
            const resp = await window.actions[methodName]();
            Renderer.#populateMainTableData(resp.data);
            Renderer.#updateCurrentPageNumber(resp.page);
        }
    }

}

Renderer.init();
