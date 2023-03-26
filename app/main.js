const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const ApplicationFileEncoding = { encoding: 'utf-8' };
const KeyboardRefreshShortcuts = [
    'CmdOrCtrl+Shift+R',
    'Shift+F5',
    'CmdOrCtrl+F5',
    'CmdOrCtrl+Shift+F5',
    'CmdOrCtrl+R',
    'F5'
];

class Main {

    static #settings = {
        load: {
            display: false,
            msgBox: {},
            err: undefined
        },
        eslinky: {}
    };
    static #appWindow;

    static init() {
        Main.#loadSettingsJSON();
        app.whenReady().then(() => {
            // Disable all chromium refresh keyboard commands
            // globalShortcut.registerAll(KeyboardRefreshShortcuts, () => { 
            //console.log('Chromium window refresh shortcuts are disabled.') 
            // });

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

    static #loadSettingsJSON() {
        const config = path.join(`${__dirname}/config/`);
        const settings = path.join(config, 'settings.json');
        const copyDefaultSettings = () => {
            fs.copyFileSync(path.join(`${__dirname}/resource/templates/settings.default.json`), settings);
        }
        const loadSettings = () => {
            const file = fs.readFileSync(settings, ApplicationFileEncoding);
            console.log(JSON.parse(file));
        }
        if (!fs.existsSync(config)) { // Expected first time app start
            fs.mkdirSync(config);
            copyDefaultSettings();
            Main.#settings.load.display = true;
            Main.#settings.load.msgBox = {
                message: 'Thank you for using eSLinky!',
                type: 'info',
                buttons: [],
                defaultId: 0,
                title: 'eSLinky: First time startup',
                detail: ''
            }
        }
        try {
            loadSettings();
        } catch (err) {
            Main.#settings.load.display = true;
            if (err.code === 'ENOENT') {
                copyDefaultSettings();
                Main.#settings.load.msgBox = {
                    message: 'No settings.json file was found. Default settings.json file will be created.',
                    type: 'warning',
                    buttons: [],
                    defaultId: 0,
                    title: 'eSLinky: No settings.json file',
                    detail: ''
                }
            } else {
                const files = fs.readdirSync(config, ApplicationFileEncoding);
                const backupDir = Date.now();
                Main.#settings.load.msgBox = {
                    message: 'Unable to load settings.json due to errors. Resolve errors within the file or delete it.',
                    type: 'error',
                    buttons: ['OK', 'Open File', 'Delete File'],
                    defaultId: 1,
                    title: 'eSLinky: Error loading settings.json',
                    detail: 'If choosing to delete, existing files and directories will be backed up inside config/.old'
                }
            }
        }
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
            if (Main.#settings.load.display) {
                dialog.showMessageBoxSync(Main.#appWindow, Main.#settings.load.msgBox);
            }
        });

        // Open Dev Tools
        // Main.#appWindow.webContents.openDevTools({ mode: 'detach' });
    }

    static #handlePreloadApiKey() {
        ipcMain.handle('preload-icons', (event, icons) => {
            // ipcMain.handleOnce('preload-icons', (event, icons) => {
            let resp = [];
            icons.forEach(icon => {
                resp.push(fs.readFileSync(path.join(`${__dirname}/assets/svg/${icon}.svg`), ApplicationFileEncoding));
            });
            return resp;
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
}

Main.init();
