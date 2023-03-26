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
    static #window;
    static #devTools = { mode: 'bottom' };

    static init() {
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

    static #createWindow() {
        Main.#window = new BrowserWindow({
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

        // Disable browser refresh keyboard shortcuts
        Main.#window.on('focus', (event) => {

        })

        Main.#preloadIconsHandler();
        Main.#windowButtonHandlers();
        Main.#window.loadURL(path.join(__dirname, 'index.html'));
        // Do not show window until DOM and styling are loaded
        Main.#window.once('ready-to-show', () => {
            Main.#window.show();
        });

        // Open Dev Tools
        Main.#window.webContents.openDevTools(Main.#devTools);
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

    static #windowButtonHandlers() {
        ipcMain.handle('window-button-minimize', (event) => {
            Main.#window.minimize();
        });

        ipcMain.handle('window-button-maximize', (event) => {
            if(Main.#window.isMaximized()) {
                Main.#window.unmaximize();
                // Additional if statement for dev tools.
                // Noticed that when dev tools was open while maximized,
                // minimizing would hide dev tools.
                // if(Main.#window.webContents.isDevToolsOpened()) {
                //     Main.#window.webContents.closeDevTools();
                //     Main.#window.webContents.openDevTools(Main.#devTools)
                // }
            } else if(Main.#window.isFullScreen()) {
                Main.#window.setFullScreen(false);
            } else {
                Main.#window.maximize();
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
            console.log('dock-help');
        });
        ipcMain.handle('dock-settings', (event) => {
            console.log('dock-settings');
        });
    }
}

Main.init();
