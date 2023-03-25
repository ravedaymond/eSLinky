interface ApplicationApi {

    apiKey: string;

    exposeInMainWorld(contextBridge: Electron.ContextBridge): void;



}
export declare namespace IpcApiServiceInterface {
    type ApiKeyType = keyof typeof window;

    export interface ApiRequest {
        channel: string;
        args?: any[];
    }

    export interface RendererApi {
        windowKey: ApiKeys;
        apiKey: string;
        args?: any[];

        exposeMain(contextBridge: Electron.ContextBridge): void;
        exposeIsolated(contextBridge: Electron.ContextBridge): void;

    }

    export interface MainApi {
        channel: string;
        handle(event: Electron.IpcMainInvokeEvent, request: ApiRequest): void;
    }

}

export class Push implements IpcApiServiceInterface.MainApi {
    channel = 'push';
    handle(event: Electron.IpcMainEvent, request: IpcApiServiceInterface.ApiRequest): (Promise<void>) | (any) {
        return 'pull';
    }
}

// export class PushRenderer implements IpcApiServiceInterface.RendererApi {
//     windowKey = ApiKeys.push;
//     apiKey = 'push';
//     exposeMain(contextBridge: Electron.ContextBridge): void {
//         contextBridge.exposeInMainWorld(this.apiKey, {

//         })
//     }
    
//     exposeIsolated(contextBridge: Electron.ContextBridge): void {}
// };
