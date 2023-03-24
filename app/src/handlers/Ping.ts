export default class Ping {

    static apiKey: string = 'api';
    static channel: string = 'ping';


    // static async handle(event: any, args?: any[]): Promise<string> {
    //     return 'pong';
    // }

    // static main(ipcMain: typeof Electron.ipcMain) {
    //     ipcMain.handle(this.apiKey, this.handle);
    // };

    // static renderer(contextBridge: typeof Electron.contextBridge, ipcRenderer: typeof Electron.ipcRenderer) {
    //     contextBridge.exposeInMainWorld(this.channel, {
    //         ping: this.handle
    //     });
    // }

    static api() {
        return 'pong';
    }

    static main(ipcMain: typeof Electron.ipcMain) {
        ipcMain.handle(this.channel, this.api);
    }

    static preload(contextBridge: typeof Electron.contextBridge, ipcRenderer: typeof Electron.ipcRenderer) {
        contextBridge.exposeInMainWorld(this.apiKey, {
            ping: () => ipcRenderer.invoke(this.channel)
        });
    }
    

}