export abstract class ApiMainService {

    abstract apiKey: string;
    abstract collection: ApiMain[];
    private apiBridge: object = {};

    /**
     * Registers this services api collection with both ipcMain and ipcRenderer.
     * @param ipcMain 
     * @param ipcRenderer 
     */
    registerApiCollection(ipcMain: Electron.IpcMain, ipcRenderer: Electron.IpcRenderer): void {
        this.collection.forEach(api => {
            console.log('Registering api', api.apiName);
            ipcMain.handle(api.channel, (event: Electron.IpcMainInvokeEvent, args: any[]) => api.process(args));

            Object.defineProperty(this.apiBridge, api.apiName, {
                value: (...args: any) => ipcRenderer.invoke(api.channel, args),
                writable: true,
                enumerable: true,
                configurable: true
            });
        });
        console.log(this.apiBridge);
    };

    getApiBridge(): object {
        return this.apiBridge;
    }
}

export abstract class ApiMain {
    apiName: string;
    channel: string;

    constructor() {
        let str = this.constructor.name.split(/(?=[A-Z])/);
        this.setApiName(str);
        this.setChannel(str);
        console.log(this.channel, this.apiName);
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

export class EslinkTestApiService extends ApiMainService {
    apiKey: 'eslink';
    collection: ApiMain[] = [
        new PingApi(),
        new PushApi(),
        new AddNumbersApi()
    ]
}

class PingApi extends ApiMain {
    process() {
        return 'ping';
    }
}

class PushApi extends ApiMain {
    process() {
        return 'pull';
    }
}

class AddNumbersApi extends ApiMain {
    process(args: number[]) {
        let resp = 0;
        args.forEach(number => {
            resp+=number;
        });
        return resp;
    }
}