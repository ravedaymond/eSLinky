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
            icons: (icons) => ipcRenderer.invoke('preload-icons', icons),
            data: () => ipcRenderer.invoke('preload-data'),
            complete: () => ipcRenderer.invoke('preload-complete')
        });
        contextBridge.exposeInMainWorld('actions', {
            titlebarMinimize: () => ipcRenderer.invoke('titlebar-minimize'),
            titlebarMaximize: () => ipcRenderer.invoke('titlebar-maximize'),
            titlebarClose: () => ipcRenderer.invoke('titlebar-close'),
            dockFileSymlink: () => ipcRenderer.invoke('dock-file-symlink'),
            dockFolderSymlink: () => ipcRenderer.invoke('dock-folder-symlink'),
            dockFolderSearch: () => ipcRenderer.invoke('dock-folder-search'),
            dockTerminal: () => ipcRenderer.invoke('dock-terminal'),
            dockHelp: () => ipcRenderer.invoke('dock-help'),
            dockSettings: () => ipcRenderer.invoke('dock-settings'),
            pagerFirst: () => ipcRenderer.invoke('pager-first'),
            pagerPrevious: () => ipcRenderer.invoke('pager-previous'),
            pagerSelect: (page) => ipcRenderer.invoke('pager-select', page),
            pagerNext: () => ipcRenderer.invoke('pager-next'),
            pagerLast: () => ipcRenderer.invoke('pager-last'),
        });
        contextBridge.exposeInMainWorld('keybind', {
            enter: () => ipcRenderer.invoke('keybind-enter'),
            escape: (callback) => ipcRenderer.on('keybind-escape', callback)
        });
    }
}

Preload.init();
