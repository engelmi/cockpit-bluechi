import cockpit from "cockpit"

import { BlueChiNode } from "../model/bluechi"

export class BlueChiClient {

    static client?: BlueChiClient;
    static getClient(): BlueChiClient {
        if(BlueChiClient.client===undefined){
            BlueChiClient.client = new BlueChiClient();
        }
        return BlueChiClient.client;
    }

    bluechiService: cockpit.DBusClient;
    bluechi_controller_proxy?: cockpit.DBusProxy;
    bluechi_monitor_proxy?: cockpit.DBusProxy;

    constructor(){
        this.bluechiService = cockpit.dbus('org.eclipse.bluechi', {
            bus: "system",
        });
    }

    private async getControllerProxy(): Promise<cockpit.DBusProxy>{
        if(this.bluechi_controller_proxy===undefined){
            this.bluechi_controller_proxy = this.bluechiService.proxy('org.eclipse.bluechi.Controller', '/org/eclipse/bluechi');
            await this.bluechi_controller_proxy.wait();
        }
        return this.bluechi_controller_proxy;
    }

    private async getMonitorProxy(path: string): Promise<cockpit.DBusProxy>{
        if(this.bluechi_monitor_proxy===undefined){
            this.bluechi_monitor_proxy = this.bluechiService.proxy('org.eclipse.bluechi.Monitor', path);
            await this.bluechi_monitor_proxy.wait();
        }
        return this.bluechi_monitor_proxy;
    }

    private async getNodeProxy(path: string): Promise<cockpit.DBusProxy> {
        const node_proxy = this.bluechiService.proxy('org.eclipse.bluechi.Node', path);
        await node_proxy.wait();
        return node_proxy;
    }

    async listNodes(): Promise<BlueChiNode[]> {
        const controllerProxy = await this.getControllerProxy();
        var call  = controllerProxy.ListNodes();
        return new Promise<BlueChiNode[]>((resolve, reject) => {
            call.fail((msg)=> {
                reject(msg);
            });
            call.done((nodeResponse: any[]) => {
                var nodes: BlueChiNode[] = []
                nodeResponse.forEach(elem => {
                    nodes.push({
                        nodeName: elem[0],
                        nodePath: elem[1],
                        nodeState: elem[2],
                        nodeIP: elem[3],
                    })
                });
                resolve(nodes);
            });
        });
    }

    async setupNodeMonitor(nodePath: string, handler: (state: string) => void): Promise<void> {
        const node_proxy = await this.getNodeProxy(nodePath);
        node_proxy.addEventListener("changed", (event, data) => {
            const newState = data.Status;
            if (newState === undefined || newState === ""){
                return;
            }
            console.log("new state: ", newState);
            handler((newState as string));
        })

        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    async setupMonitor(): Promise<void> {
        const controllerProxy = this.getControllerProxy();

        const test = async (monitor_path: string) : Promise<void> => {
            const monitor_proxy = this.getMonitorProxy(monitor_path);
            monitor_proxy.Subscribe("*", "*")
        }  

        return new Promise<void>((resolve, reject) => {
            var call = controllerProxy.CreateMonitor();
            call.fail((msg) => {
                reject(msg);
            });
            call.done((monitor_path: string) => {
                test(monitor_path)
                
            });
        });
    }
}
