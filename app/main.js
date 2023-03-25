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

    static init() {
        app.whenReady().then(() => {
            // Disable all chromium refresh keyboard commands
            globalShortcut.registerAll(KeyboardRefreshShortcuts, () => { 
                //console.log('Chromium window refresh shortcuts are disabled.') 
            });

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
        Main.#window.webContents.openDevTools({ mode: 'detach' });
    }

    static #preloadIconsHandler() {
        ipcMain.handleOnce('preload-icons', (event, icons) => {
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
}

Main.init();