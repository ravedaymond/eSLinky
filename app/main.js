const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
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

class Main {
    static #appWindow;
    static #helpWindow;
    static #devToolsOptions = { mode: 'bottom' };

    static init() {
        app.whenReady().then(() => {
            // Disable all chromium refresh keyboard commands
            // globalShortcut.registerAll(KeyboardRefreshShortcuts, () => { 
                //console.log('Chromium window refresh shortcuts are disabled.') 
            // });

            Main.#createAppWindow();
            // Windows are only able to be created after the ready event. 
            // Listen for 'activate' events after the window has been created.
            app.on('activate', () => {
                // On OS X it's common to re-create a window in the app when the
                // dock icon is clicked and there are no other windows open.
                if (BrowserWindow.getAllWindows().length === 0) {
                    Main.#createAppWindow();
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

    static #createAppWindow() {
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

        Main.#preloadIconsHandler();
        Main.#appWindowButtonHandlers();
        Main.#dockButtonHandlers();

        Main.#appWindow.loadURL(path.join(__dirname, 'index.html'));
        // Do not show window until DOM and styling are loaded
        Main.#appWindow.once('ready-to-show', () => {
            Main.#appWindow.show();
        });

        // Open Dev Tools
        Main.#appWindow.webContents.openDevTools(Main.#devToolsOptions);
    }

    static #preloadIconsHandler() {
        // ipcMain.handleOnce('preload-icons', (event, icons) => {
        ipcMain.handle('preload-icons', (event, icons) => {
            let resp = [];
            icons.forEach(icon => {
                resp.push(fs.readFileSync(path.join(`${__dirname}/assets/svg/${icon}.svg`), { encoding: 'utf-8' }));
            });
            return resp;
        });
    }

    static #appWindowButtonHandlers() {
        ipcMain.handle('window-button-minimize', (event) => {
            Main.#appWindow.minimize();
        });

        ipcMain.handle('window-button-maximize', (event) => {
            if(Main.#appWindow.isMaximized()) {
                Main.#appWindow.unmaximize();
                // Additional if statement for dev tools.
                // Noticed that when dev tools was open while maximized,
                // minimizing would hide dev tools.
                // if(Main.#appWindow.webContents.isDevToolsOpened()) {
                //     Main.#appWindow.webContents.closeDevTools();
                //     Main.#appWindow.webContents.openDevTools(Main.#devToolsOptions)
                // }
            } else if(Main.#appWindow.isFullScreen()) {
                Main.#appWindow.setFullScreen(false);
            } else {
                Main.#appWindow.maximize();
            }
        });

        ipcMain.handle('window-button-close', (event) => {
            app.quit();
        });
    }

    static #dockButtonHandlers() {
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
            Main.#helpWindow = new BrowserWindow({
                parent: Main.#appWindow,
                modal: true,
                title: 'About eSLink',
                titleBarStyle: '',
                width: 400,
                height: 300,
                resizable: false,
                fullscreenable: false,
                webPreferences: {
                    sandbox: true,
                    devTools: false
                }
            });
            Main.#helpWindow.setMenuBarVisibility(false);
        });
        ipcMain.handle('dock-settings', (event) => {
            console.log('dock-settings');
        });
    }
}

Main.init();
