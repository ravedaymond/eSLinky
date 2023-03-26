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
            dockFileSymlink: () => ipcRenderer.invoke('dock-file-symlink'),
            dockFolderSymlink: () => ipcRenderer.invoke('dock-folder-symlink'),
            dockFolderSearch: () => ipcRenderer.invoke('dock-folder-search'),
            dockTerminal: () => ipcRenderer.invoke('dock-terminal'),
            dockHelp: () => ipcRenderer.invoke('dock-help'),
            dockSettings: () => ipcRenderer.invoke('dock-settings'),
        });
    }
}

Preload.init();