const { contextBridge, ipcRenderer } = require ('electron');

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  // we can also expose variables, not just functions
  electron: process.versions.electron,
});

contextBridge.exposeInMainWorld('pong', {
    ping: () => ipcRenderer.invoke('pong')
});
