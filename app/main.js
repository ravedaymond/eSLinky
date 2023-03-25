const { app, BrowserWindow } = require('electron');
const path = require('path');

class Main {
    mainWindow;
    init() {
        app.whenReady().then(() => {
            this.createWindow();
            // Windows are only able to be created after the ready event. 
            // Listen for 'activate' events after the window has been created.
            app.on('activate', () => {
                // On OS X it's common to re-create a window in the app when the
                // dock icon is clicked and there are no other windows open.
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.createWindow();
                }
            });
        })
        // Quit when all windows are closed, except on macOS. There, it's common
        // for applications and their menu bar to stay active until the user quits
        // explicitly with Cmd + Q.
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    }

    createWindow() {
        this.mainWindow = new BrowserWindow({
            titleBarStyle: 'hidden',
            titleBarOverlay: {
                color: "#4F6D7A",
                symbolColor: "#EAEAEA",
                height: 39
            },
            width: 800,
            height: 600,
            show: false,
            webPreferences: {
                sandbox: true,
                preload: path.join(__dirname, 'preload.js'),
            },
        });

        this.mainWindow.loadURL(path.join(__dirname, 'index.html'));

        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
        })
        
        // Open Dev Tools
        this.mainWindow.webContents.openDevTools();
    }

    setupHandlers() {
        ipcMain.handle('ping', (event) => 'pong');
    }

}

(new Main()).init();