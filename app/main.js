const { app, BrowserWindow, ipcMain, globalShortcut, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let appliedTheme;

class Main {

    static #settings = {};
    static #appWindow;
    static #pagination = {
        current: 0,
        pages: 1,
        perPage: 50
    }

    static init() {
        app.whenReady().then(() => {
            Main.#settingsLoad();
            Main.#paginationSetPages();

            Main.#appCreateWindow();
            
            Main.#keybindsHandler();
            // Windows are only able to be created after the ready event. 
            // Listen for 'activate' events after the window has been created.
            app.on('activate', () => {
                // On OS X it's common to re-create a window in the app when the
                // dock icon is clicked and there are no other windows open.
                if (BrowserWindow.getAllWindows().length === 0) {
                    Main.#appCreateWindow();
                }
            });
        });
        // Quit when all windows are closed, except on macOS. There, it's common
        // for applications and their menu bar to stay active until the user quits
        // explicitly with Cmd + Q.
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    }

    /*
    APP
    */
    static #appCreateWindow() {
        Main.#appWindow = new BrowserWindow({
            titleBarStyle: 'hidden',
            width: 800,
            height: 600,
            show: false,
            webPreferences: {
                sandbox: true,
                devTools: true,
                preload: path.join(__dirname, 'preload.js'),
            },
        });

        Main.#preloadHandler();
        Main.#actionsHandler();

        Main.#appWindow.loadURL(path.join(__dirname, 'index.html'));
        // Do not show window until DOM and styling are loaded
        Main.#appWindow.once('ready-to-show', () => {
            Main.#appWindow.show();
        });

        // Open Dev Tools
        Main.#appWindow.webContents.openDevTools({ mode: 'undocked' });
    }

    static #assetLoadIconSVG(icon) {
        return fs.readFileSync(path.join(`${__dirname}/assets/svg/${icon}.svg`), { encoding: 'utf-8' });
    }

    /*
    ACTIONS
    */
    static #actionsHandler() {
        Main.#actionsTitlebar();
        Main.#actionsDock();
        Main.#actionsPagination();
    }

    static #actionsDock() {
        ipcMain.handle('dock-file-symlink', (event) => {
            console.log('dock-file-symlink');
        });
        ipcMain.handle('dock-folder-symlink', (event) => {
            console.log('dock-folder-symlink');
        });
        ipcMain.handle('dock-folder-search', (event) => {
            console.log('dock-folder-search');
        });
        // ipcMain.handle('dock-terminal', (event) => {
        //     console.log('dock-terminal');
        // });
        ipcMain.handle('dock-help', (event) => {
            console.log('dock-help');
        });
        ipcMain.handle('dock-settings', (event) => {
            console.log('dock-settings');
        });
    }

    static #actionsPagination() {
        ipcMain.handle('pager-first', (event) => {
            const resp = {
                data: Main.#paginationGetPageTableHTML(0),
                page: Main.#pagination.current
            }
            return resp;
        });
        ipcMain.handle('pager-previous', (event) => {
            const resp = {
                data: Main.#paginationGetPageTableHTML(Main.#pagination.current - 1),
                page: Main.#pagination.current
            }
            return resp;
        });
        ipcMain.handle('pager-select', (event, page) => {
            const resp = {
                data: Main.#paginationGetPageTableHTML(page - 1),
                page: Main.#pagination.current
            };
            return resp;
        });
        ipcMain.handle('pager-next', (event) => {
            const resp = {
                data: Main.#paginationGetPageTableHTML(Main.#pagination.current + 1),
                page: Main.#pagination.current
            }
            return resp;
        });
        ipcMain.handle('pager-last', (event) => {
            const resp = {
                data: Main.#paginationGetPageTableHTML(Main.#pagination.pages - 1),
                page: Main.#pagination.current
            }
            return resp;
        });
    }

    static #actionsTitlebar() {
        ipcMain.handle('titlebar-minimize', (event) => {
            Main.#appWindow.minimize();
        });

        ipcMain.handle('titlebar-maximize', (event) => {
            if (Main.#appWindow.isMaximized()) {
                Main.#appWindow.unmaximize();
                // Additional if statement for dev tools.
                // Noticed that when dev tools was open while maximized,
                // minimizing would hide dev tools.
                // if(Main.#appWindow.webContents.isDevToolsOpened()) {
                //     Main.#appWindow.webContents.closeDevTools();
                //     Main.#appWindow.webContents.openDevTools(Main.#devTools)
                // }
            } else if (Main.#appWindow.isFullScreen()) {
                Main.#appWindow.setFullScreen(false);
            } else {
                Main.#appWindow.maximize();
            }
        });

        ipcMain.handle('titlebar-close', (event) => {
            app.quit();
        });
    }

    /*
    KEYBINDINGS
    */
    static #keybindsHandler() {
        Main.#keybindsServerDisableChromiumRefresh();
        Main.#keybindsServerQuitApp();
        Main.#keybindsCallbackClearInputFocus();
        Main.#keybindsCallbackToggleTerminal();
        Main.#appWindow.webContents.on('before-input-event', (event, input) => {
            event.preventDefault();
        });
    }

    static #keybindsServerDisableChromiumRefresh() {
        const binds = [
            'CmdOrCtrl+Shift+R',
            'Shift+F5',
            'CmdOrCtrl+F5',
            'CmdOrCtrl+Shift+F5',
            // 'CmdOrCtrl+R',
            'F5'
        ];
        // TODO Ensure chromium refresh commands are disabled.
        globalShortcut.registerAll(binds, () => {
            console.log('Chromium window refresh shortcuts are disabled.');
        });
    }

    static #keybindsServerQuitApp() {
        globalShortcut.register('Ctrl+Q', () => {
            console.log('Keybind executed: Ctrl+Q');
            app.quit();
        });
    }

    static #keybindsCallbackClearInputFocus() {
        globalShortcut.register('Esc', () => {
            Main.#appWindow.webContents.send('keybind-escape');
        });
    }

    static #keybindsCallbackToggleTerminal() {
        globalShortcut.register('Ctrl+T', () => {
            Main.#appWindow.webContents.send('keybind-terminal');
        });
    }

    /*
    LOGGING
    */
   static #loggingToFile() {
    
   }

    /*
    PAGINATION
    */
    static #paginationSetPages() {
        // ### LOCAL TEST DATA ONLY
        Main.#settings.links = Main.#Test.testData100();
        const records = Main.#settings.links.length;
        const remainder = (records % Main.#pagination.perPage);
        Main.#pagination.pages = (records - remainder) / Main.#pagination.perPage
            + ((remainder > 0) ? 1 : 0);
    }

    static #paginationGetPageNumbersHTML() {
        let resp = [];
        for (let i = 0; i < Main.#pagination.pages; i++) {
            resp.push(
                `<div class="pager-number pager-button">${i + 1}</div>`
            );
        }
        return resp;
    }

    static #paginationGetPageTableHTML(page) {
        const data = [];
        if (page >= 0 && page < Main.#pagination.pages) {
            Main.#pagination.current = page;
            const begin = Main.#pagination.current * Main.#pagination.perPage;
            const end = (begin + Main.#pagination.perPage);
            const pageLinks = Main.#settings.links.slice(begin, end);
            for (let i = 0; i < pageLinks.length; i++) {
                data.push(Main.#paginationCreateTableRow(pageLinks[i], i, {
                    target: Main.#assetLoadIconSVG('tableTarget'),
                    active: Main.#assetLoadIconSVG('tableActive'),
                    hard: Main.#assetLoadIconSVG('tableHard'),
                    junction: Main.#assetLoadIconSVG('tableJunction')
                }));
            }
        }
        return data;
    }

    static #paginationCreateTableRow(link, indexInPage, assets) {
        const formId = `page-${indexInPage}`;
        const type = Main.#assetLoadIconSVG(`tableType${(link.file ? 'File' : 'Folder')}`)
        const target = fs.existsSync(link.target); // Check if target exists
        // const link = fs.existsSync() // Check if links containing directory exists
        return `
        <tr>
            <td>
                <form id="${formId}">
                    <input type="submit" value="${indexInPage}"/>
                </form>
            </td>
            <td>
                <input form="${formId}" class="data-checkbox" type="checkbox" name="checkbox" />
            </td> 
            <td class="table-attributes">
                <div class="table-icon">${type}</div>
                <div class="table-icon table-icon-${link.active ? 'active' : 'inactive'}">${assets.active}</div>
                <div class="table-icon table-icon-${target ? '' : 'inactive'}">${assets.target}</div>
                <div class="table-icon table-icon-${link.hard ? 'active' : 'inactive'}">${assets.hard}</div>
                <div class="table-icon table-icon-${link.junction ? 'active' : 'inactive'}">${assets.junction}</div>
            </td>
            <td class="table-name">
                <input form="${formId}" type="text" minlength="1" maxlength="32" name="name" value="${link.name}" />
            </td>
            <td class="table-description">
                <input form="${formId}" type="text" name="description" value="${link.description}" />
            </td>
        </tr>
        `;
    }

    /*
    PRELOAD
    */
    static #preloadHandler() {
        // ipcMain.handleOnce('preload-icons', (event, icons) => {
        ipcMain.handle('preload-icons', (event, icons) => {
            let resp = [];
            icons.forEach(icon => {
                resp.push(Main.#assetLoadIconSVG(icon));
            });
            return resp;
        });
        ipcMain.handle('preload-data', (event) => {
            return {
                pageHTML: Main.#paginationGetPageNumbersHTML(),
                tableData: Main.#paginationGetPageTableHTML(0)
            };
        });
        ipcMain.handle('preload-complete', (event) => {
            console.log('Preload completed.');
            // Main.#appWindow.show();
        });
    }

    /*
    SETTINGS
    */
    static #settingsLoad() {
        const config = path.join(`${__dirname}/config/`);
        const settings = path.join(config, 'settings.json');
        const template = path.join(`${__dirname}src/resource/templates/settings.default.json`);
        const loadSettingsFromPath = (target) => {
            Main.#settings = JSON.parse(fs.readFileSync(target), { encoding: 'utf-8' }).eslinky;
            Main.#settingsSetThemeCSS();
        }
        const createSettingsFromTemplate = () => {
            fs.copyFileSync(template, settings);
        }
        if (!fs.existsSync(config)) { // Expected first time app start
            fs.mkdirSync(config);
            createSettingsFromTemplate();
            dialog.showMessageBoxSync({
                message: 'Thank you for using eSLinky!',
                type: 'info',
                buttons: [],
                defaultId: 0,
                title: 'eSLinky: First time startup',
                detail: ''
            });
            return;
        }
        try {
            loadSettingsFromPath(settings);
        } catch (err) {
            // Load default template settings before making any file based on the error.
            // This will allow all the error handling alerts to be handled in the app window dialogue with styling.
            // TODO: Move error message boxes to in-app styling.
            loadSettingsFromPath(template);
            if (err.code === 'ENOENT') {
                createSettingsFromTemplate();
                dialog.showMessageBoxSync({
                    message: 'No settings.json file was found. Default settings.json file will be created.',
                    type: 'warning',
                    title: 'eSLinky: No settings.json file'
                });
            } else {
                const choice = dialog.showMessageBoxSync({
                    message: 'Unable to load settings.json due to errors. Resolve errors within the file or delete it.',
                    type: 'error',
                    buttons: ['OK', 'Open File', 'Delete File'],
                    defaultId: 1,
                    title: 'eSLinky: Error loading settings.json',
                    detail: `${err.message}\n\nIf deleting, existing files and directories will be backed in a unique directory inside \`config/.old/\`.`
                });
                if (choice < 1) {
                    app.quit();
                    return;
                } else if (choice === 1) {
                    shell.openPath(settings);
                    app.quit();
                } else if (choice >= 2) {
                    const files = fs.readdirSync(config, { encoding: 'utf-8', withFileTypes: true });
                    const old = path.join(config, '.old');
                    const backup = path.join(`${old}/${Date.now()}/`);
                    if (!fs.existsSync(old)) {
                        fs.mkdirSync(old);
                    }
                    fs.mkdirSync(path.join(backup));
                    try {
                        files.forEach(file => {
                            if (file.name !== '.old') {
                                const src = path.join(config, file.name);
                                fs.renameSync(path.join(config, file.name), path.join(backup, file.name));
                            }
                        });
                        createSettingsFromTemplate();
                    } catch (err) {
                        const choice = dialog.showMessageBoxSync({
                            message: 'Error creating backup of files in config. Recommend deleting the config directory complete.',
                            type: 'error',
                            buttons: ['OK', 'Open Config', 'Delete Config'],
                            defaultId: 1,
                            title: 'eSLinky: Error with config backup',
                            detail: `Warning: Deleting config will lose record of all links settings.json file. These links will still be live in your operating system.`
                        });
                        if (choice < 1) {
                            app.quit();
                        } else if (choice === 1) {
                            shell.openPath(config);
                            app.quit();
                        } else if (choice >= 2) {
                            fs.rmSync(config, { recursive: true, force: true });
                            fs.mkdirSync(config);
                            createSettingsFromTemplate();
                        }
                    }
                }
            }
        }
    }

    static #settingsSave() {
        const p = path.join(__dirname, 'config/settings.json');
        fs.truncateSync(p);
        fs.appendFileSync(p, JSON.stringify({ eslinky: Main.#settings }, null, 4));
    }

    static #settingsSetThemeCSS() {
        try {
            const appliedTheme = JSON.stringify(Main.#settings.themes[Main.#settings.preferences.theme], null, 4)
                .replaceAll('",', ';').replaceAll('"', '').replace(')\n}', ');\n}\n').replace('{', ':root {');
            fs.writeFileSync(path.join(`${__dirname}/src/css/theme.css`), appliedTheme, { force: true });
        } catch (err) {
            throw new Error('Unable to load requested theme. Recommend validating settings.json file.');
        }
    }

    /*
    TEST
    */
    static #Test = class {

        static testData25() {
            return Main.#Test.#readMockData('25');
        }

        static testData50() {
            return Main.#Test.#readMockData('50');
        }

        static testData100() {
            return Main.#Test.#readMockData('100');
        }

        static testData200() {
            return Main.#Test.#readMockData('200');
        }

        static testDataFull() {
            return Main.#Test.#readMockData('DATA');
        }

        static #readMockData(file) {
            return JSON.parse(fs.readFileSync(path.join(`${__dirname}/test/resource/MOCK_${file}.json`), { encoding: 'utf-8' }));
        }
    }

}

Main.init();
