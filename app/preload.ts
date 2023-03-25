// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { RendererService } from "./src/services/api-interfaces";

// Expose apiKey to be used via renderer.
// Then, populate available api invocations in apiKey: {...}
// contextBridge.exposeInMainWorld('eslink', {
    // ping: () => ipcRenderer.invoke('ping'),
    // foo: () => ipcRenderer.invoke('foo'),
    // addNumbers: (num1: number, num2: number) => ipcRenderer.invoke('add-numbers', num1, num2),
    // addNumbersAlt: (num1: number, num2: number) => ipcRenderer.invoke('add-numbers-alt', num1, num2),
    // methodWithArgs: (args: any[]) => ipcRenderer.invoke('method-with-args', args),
    // methodWithArgsAlt: (...args: any[]) => ipcRenderer.invoke('method-with-args-alt', args),
    // push: () => ipcRenderer.invoke('push-api'),
    // addNumbers: (numbers: []) => ipcRenderer.invoke('add-numbers-api'),
// });

// import { PreloadBridge } from "./src/services/api-interfaces";
// window.addEventListener('DOMContentLoaded', () => {
//     // ipcRenderer.invoke('preload-request').then(resp => {
//     //     window.alert(resp);
//     //     // 
//     // });
//     ipcRenderer.invoke('preload').then(resp => {
//         resp.forEach((bridge: PreloadBridge) => {
//             contextBridge.exposeInMainWorld(bridge.apiKey, bridge.apiBridge);
//         });
//         console.log('exposed bridges in main world');
//         const test = window.eslink.pingApi();
//         console.log('ping', test);
//     });
// });
