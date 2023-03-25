export enum ApiKey {
    eslink = 'eslink'
}

export abstract class MainService {

    private apiBridge: object = {};
    private apiKey: string;
    abstract collection: Api[];

    constructor(apiKey: ApiKey) {
        this.apiKey = apiKey.valueOf();
    }

    /**
     * Registers this services api collection with both ipcMain and ipcRenderer.
     * @param ipcMain 
     * @param ipcRenderer 
     */
    registerApiCollection(ipcMain: Electron.IpcMain, ipcRenderer: Electron.IpcRenderer): void {
        console.group('Registering api collection [', this.apiKey, ']...');

        this.collection.forEach(api => {
            console.info('Defining channel', api.channel, 'in ipcMain...');
            ipcMain.handle(api.channel, (event: Electron.IpcMainInvokeEvent, args: any[]) => api.process(args));

            console.info('Creating bridge function', api.apiName, 'in ipcRenderer...');
            Object.defineProperty(this.apiBridge, api.apiName, {
                value: (...args: any) => ipcRenderer.invoke(api.channel, args),
                writable: true,
                enumerable: true,
                configurable: true
            });
            console.info('Channel defined.');
        });
        RendererService.addPreloadBridge({ apiKey: this.apiKey, apiBridge: this.apiBridge });
        console.groupEnd();
        console.info('Successfully registered api collection [', this.apiKey, '].');
    };
}

export type PreloadBridge = { apiKey: string; apiBridge: object; };
export class RendererService {

    static preloadBridges: PreloadBridge[] = [];

    static addPreloadBridge(preloadBridge: PreloadBridge) {
        RendererService.preloadBridges.push(preloadBridge);
        console.info('Preload bridges: ', this.preloadBridges);
    }

    static openBridges(contextBridge: Electron.ContextBridge) {
        console.group('Bridging renderer and main api collections...', RendererService.preloadBridges);
        RendererService.preloadBridges.forEach(bridge => {
            contextBridge.exposeInMainWorld(bridge.apiKey, bridge.apiBridge);
        });
        console.groupEnd();
    }
}

abstract class Api {
    apiName: string;
    channel: string;

    constructor() {
        let str = this.constructor.name.split(/(?=[A-Z])/);
        this.setApiName(str);
        this.setChannel(str);
    }

    abstract process(...args: any[]): (Promise<void>) | (any);

    private setApiName(strArr: string[]) {
        strArr[0] = strArr[0].toLowerCase();
        this.apiName = strArr.join('');
    }

    private setChannel(strArr: string[]) {
        this.channel = strArr.join('-').toLowerCase();
    }
}

export class EslinkTestService extends MainService {
    collection: Api[] = [
        new PingApi(),
        new PushApi(),
        new AddNumbersApi()
    ];

    constructor() {
        super(ApiKey.eslink);
    }
}

class PingApi extends Api {
    process() {
        return 'ping';
    }
}

class PushApi extends Api {
    process() {
        return 'pull';
    }
}

class AddNumbersApi extends Api {
    process(args: number[]) {
        let resp = 0;
        args.forEach(number => {
            resp += number;
        });
        return resp;
    }
}
