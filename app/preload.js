const { contextBridge, ipcRenderer } = require('electron');

class Preload {

    static init() {
        contextBridge.exposeInMainWorld('versions', {
            node: () => process.versions.node,
            chrome: () => process.versions.chrome,
            // we can also expose variables, not just functions
            electron: process.versions.electron,
        });
        contextBridge.exposeInMainWorld('preload', {
            icons: (icons) => ipcRenderer.invoke('preload-icons', icons)
        });
        contextBridge.exposeInMainWorld('actions', {
            windowMinimize: () => ipcRenderer.invoke('window-button-minimize'),
            windowMaximize: () => ipcRenderer.invoke('window-button-maximize'),
            windowClose: () => ipcRenderer.invoke('window-button-close'),
        });
    }
}

Preload.init();