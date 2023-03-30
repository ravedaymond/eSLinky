const { app, BrowserWindow, ipcMain, globalShortcut, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const KeyboardRefreshShortcuts = [
    'CmdOrCtrl+Shift+R',
    'Shift+F5',
    'CmdOrCtrl+F5',
    'CmdOrCtrl+Shift+F5',
    'CmdOrCtrl+R',
    'F5'
];

let appliedTheme;

class Main {

    static #settings = {};
    static #appWindow;

    static init() {
        app.whenReady().then(() => {
            // Disable all chromium refresh keyboard commands
            // globalShortcut.registerAll(KeyboardRefreshShortcuts, () => { 
            //console.log('Chromium window refresh shortcuts are disabled.') 
            // });
            Main.#loadSettingsConfig();

            Main.#createWindow();
            // Windows are only able to be created after the ready event. 
            // Listen for 'activate' events after the window has been created.
            app.on('activate', () => {
                // On OS X it's common to re-create a window in the app when the
                // dock icon is clicked and there are no other windows open.
                if (BrowserWindow.getAllWindows().length === 0) {
                    Main.#createWindow();
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

    static #loadSettingsConfig() {
        const config = path.join(`${__dirname}/config/`);
        const settings = path.join(config, 'settings.json');
        const template = path.join(`${__dirname}src/resource/templates/settings.default.json`);
        const loadSettingsFromPath = (target) => {
            Main.#settings = JSON.parse(fs.readFileSync(target), { encoding: 'utf-8' }).eslinky;
            Main.#createThemeCSS();
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
                        if(choice < 1) {
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

    static #createThemeCSS() {
        try {
            const appliedTheme = JSON.stringify(Main.#settings.themes[Main.#settings.preferences.theme], null, 4)
                .replaceAll('",', ';').replaceAll('"', '').replace(')\n}', ');\n}\n').replace('{', ':root {');
            fs.writeFileSync(path.join(`${__dirname}/src/css/theme.css`), appliedTheme, { force: true });
        } catch (err) {
            throw new Error('Unable to load requested theme. Recommend validating settings.json file.');
        }
    }

    static #saveSettings() {
        const p = path.join(__dirname, 'config/settings.json');
        fs.truncateSync(p);
        fs.appendFileSync(p, JSON.stringify({ eslinky: Main.#settings }, null, 4));
    }

    static #makeTableRow(link, assets) {
        const type = Main.#getIconAsset(`tableType${(link.file ? 'File' : 'Folder')}`)
        const target = fs.existsSync(link.target); // Check if target exists
        // const link = fs.existsSync() // Check if links containing directory exists
        return `<tr>
            <td>
                <input class="data-checkbox" type="checkbox" />
            </td>
            <td class="table-attributes">
                <div class="table-icon">${type}</div>
                <div class="table-icon table-icon-${target ? '' : 'inactive'}">${assets.target}</div>
                <div class="table-icon table-icon-${link.active ? 'active' : 'inactive'}">${assets.active}</div>
                <div class="table-icon table-icon-${link.hard ? 'active' : 'inactive'}">${assets.hard}</div>
                <div class="table-icon table-icon-${link.junction ? 'active' : 'inactive'}">${assets.junction}</div>
            </td>
            <td class="table-name">
                <input type="text" minlength="1" maxlength="32" value="${link.name}" />
            </td>
            <td class="table-description">
                <input type="text" value="${link.description}" />
            </td>
            <td class="table-tags">${link.tags}</td>
        </tr>`;
    }

    static #getIconAsset(icon) {
        return fs.readFileSync(path.join(`${__dirname}/assets/svg/${icon}.svg`), { encoding: 'utf-8' });
    }

    static #createWindow() {
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

        Main.#handlePreloadApiKey();
        Main.#handleActionsApiKey();

        Main.#appWindow.loadURL(path.join(__dirname, 'index.html'));
        // Do not show window until DOM and styling are loaded
        Main.#appWindow.once('ready-to-show', () => {
            Main.#appWindow.show();
        });

        // Open Dev Tools
        Main.#appWindow.webContents.openDevTools({ mode: 'undocked' });
    }

    static #handlePreloadApiKey() {
        // ipcMain.handleOnce('preload-icons', (event, icons) => {
        ipcMain.handle('preload-icons', (event, icons) => {
            let resp = [];
            icons.forEach(icon => {
                resp.push(Main.#getIconAsset(icon));
            });
            return resp;
        });
        ipcMain.handle('preload-data', (event) => {
            let data = Main.#Test.testData100();
            // const data = Main.#settings.links;
            
            let table = [];
            data.forEach(link => {
                table.push(Main.#makeTableRow(link, {
                    target: Main.#getIconAsset('tableTarget'),
                    active: Main.#getIconAsset('tableActive'), 
                    hard: Main.#getIconAsset('tableHard'), 
                    junction: Main.#getIconAsset('tableJunction')
                }));
            });
            return table;
        });
    }

    static #handleActionsApiKey() {
        Main.#handleTitleBarButtons();
        Main.#handleDockButtons();
    }

    static #handleTitleBarButtons() {
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

    static #handleDockButtons() {
        ipcMain.handle('dock-file-symlink', (event) => {
            console.log('dock-file-symlink');
        });
        ipcMain.handle('dock-folder-symlink', (event) => {
            console.log('dock-folder-symlink');
        });
        ipcMain.handle('dock-folder-search', (event) => {
            console.log('dock-folder-search');
        });
        ipcMain.handle('dock-terminal', (event) => {
            console.log('dock-terminal');
        });
        ipcMain.handle('dock-help', (event) => {
            console.log('dock-help');
        });
        ipcMain.handle('dock-settings', (event) => {
            console.log('dock-settings');
        });
    }

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
