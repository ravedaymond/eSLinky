/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import { ApiKey } from './src/services/api-interfaces';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

// IPC Tests
// type ApiKey = keyof typeof window;
// const apiKey = window['eslink' as ApiKey];
// console.log(`const apiKey = window['eslink' as ApiKey];`, apiKey.ping());
// console.log(`window['eslink']`, window['eslink' as ApiKey].ping());
// console.log(`window['eslink']`, window[ApiKeys.main].ping());
// console.log(`window['eslink']`, window['eslink'].ping());
// console.log('window.eslink', window.eslink.ping());
// console.log('eslink', eslink.ping());
// ping();
// async function ping() {
//     const resp = await window.eslink.ping();
//     console.log('ping()', resp);
// }
// foo();
// async function foo() {
//     const resp = await window.eslink.foo();
//     console.log('foo()', resp);
// }
// console.log('log addNumbers', window.eslink.addNumbers(2, 3));
// addNumbers(2, 7);
// async function addNumbers(num1: number, num2: number) {
//     const resp = await window.eslink.addNumbers(num1, num2);
//     console.log('addNumbers()', resp);
// }
// addNumbersAlt(13, 23);
// async function addNumbersAlt(num1: number, num2: number) {
//     const resp = await window.eslink.addNumbersAlt(num1, num2);
//     console.log('alt()', resp);
// }
// methodWithArgs('test', 'hello');
// async function methodWithArgs(...args: any[]) {
//     const resp = await window.eslink.methodWithArgs(args);
//     console.log('methodWithArgs()', resp);
// }
// methodWithArgsAlt(true);
// async function methodWithArgsAlt(invoke: boolean) {
//     const resp = await window.eslink.methodWithArgsAlt('needs', 'to', 'see');
//     console.log('argsAlt()', resp);
// }
