// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// Expose apiKey to be used via renderer.
// Then, populate available api invocations in apiKey: {...}
contextBridge.exposeInMainWorld('eslink', {
    ping: () => ipcRenderer.invoke('ping'),
    foo: () => ipcRenderer.invoke('foo'),
    addNumbers: (num1: number, num2: number) => ipcRenderer.invoke('add-numbers', num1, num2),
    addNumbersAlt: (num1: number, num2: number) => ipcRenderer.invoke('add-numbers-alt', num1, num2),
    methodWithArgs: (args: any[]) => ipcRenderer.invoke('method-with-args', args),
    methodWithArgsAlt: (...args: any[]) => ipcRenderer.invoke('method-with-args-alt', args),
});
