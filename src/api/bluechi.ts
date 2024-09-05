import cockpit from "cockpit"

import { BlueChiNode, BlueChiUnit } from "../model/bluechi"

export class BlueChiClient {

    static client?: BlueChiClient;
    static getClient(): BlueChiClient {
        if(BlueChiClient.client===undefined){
            BlueChiClient.client = new BlueChiClient();
        }
        return BlueChiClient.client;
    }

    bluechiService: cockpit.DBusClient;
    bluechiControllerProxy?: cockpit.DBusProxy;
    bluechiMonitorProxy?: cockpit.DBusProxy;

    constructor(){
        this.bluechiService = cockpit.dbus('org.eclipse.bluechi', {
            bus: "system",
        });
    }

    private async getControllerProxy(): Promise<cockpit.DBusProxy>{
        if(this.bluechiControllerProxy===undefined){
            this.bluechiControllerProxy = this.bluechiService.proxy('org.eclipse.bluechi.Controller', '/org/eclipse/bluechi');
            await this.bluechiControllerProxy.wait();
        }
        return this.bluechiControllerProxy;
    }

    private async getMonitorProxy(path: string): Promise<cockpit.DBusProxy>{
        if(this.bluechiMonitorProxy===undefined){
            this.bluechiMonitorProxy = this.bluechiService.proxy('org.eclipse.bluechi.Monitor', path);
            await this.bluechiMonitorProxy.wait();
        }
        return this.bluechiMonitorProxy;
    }

    private async getNodeProxy(path: string): Promise<cockpit.DBusProxy> {
        const nodeProxy = this.bluechiService.proxy('org.eclipse.bluechi.Node', path);
        await nodeProxy.wait();
        return nodeProxy;
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

    async listUnits(nodePath: string): Promise<BlueChiUnit[]> {
        const nodeProxy = await this.getNodeProxy(nodePath);
        return new Promise<BlueChiUnit[]>((resolve, reject) => {
            var call  = nodeProxy.ListUnits();
            call.fail((msg)=> {
                console.log("Failed to fetch units for node '" + nodePath + "': " + msg);
                resolve([]);
            });
            call.done((unitsResponse: any[]) => {
                var units: BlueChiUnit[] = []
                unitsResponse.forEach(elem => {
                    units.push({
                        unitName: elem[0],
                        unitDescription: elem[1],
                        unitActiveState: elem[3],
                        unitSubState: elem[4],
                        unitObjectPath: elem[6],
                    })
                });
                resolve(units);
            });
        });
    }

    async setupNodeMonitor(nodePath: string, handler: (state: string) => void): Promise<void> {
        const nodeProxy = await this.getNodeProxy(nodePath);
        nodeProxy.addEventListener("changed", (event, data) => {
            const newState = data.Status;
            if (newState === undefined || newState === ""){
                return;
            }
            handler((newState as string));
        })

        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    async setupUnitMonitor(
        nodeName: string, 
        unitStateChangedHandler: (unitName: string, activeState: string, subState: string) => void,
        ): Promise<void> {
        const controllerProxy = await this.getControllerProxy();

        const subscribe = async (monitorPath: string) : Promise<void> => {
            const monitorProxy = await this.getMonitorProxy(monitorPath);

            monitorProxy.addEventListener("UnitNew", (event, data) => {
                // Currently, the load state is not displayed, so this can be skipped
            });
            monitorProxy.addEventListener("UnitRemoved", (event, data) => {
                // Currently, the load state is not displayed, so this can be skipped
            });
            monitorProxy.addEventListener("UnitStateChanged", (event, nodeName, unitName, activeState, subState) => {
                // skip artificially created unit from monitor creation
                if (unitName === "*") {
                    return;
                }
                unitStateChangedHandler(unitName, activeState, subState);
            });
            monitorProxy.addEventListener("UnitPropertiesChanged", (event, data) => {
                // Currently, no properties are displayed, so this can be skipped
            });

            var call = monitorProxy.Subscribe(nodeName, "*");
            call.fail((msg) => {
                console.log("Setting up subscription for '" + nodeName + "' failed: " + msg);
            });
            call.done((subID: string) => {
                console.log("Monitor '" + monitorPath + "' with Subscription '" + subID + "' on Node '" + nodeName + "' created");
            });
        }  

        return new Promise<void>((resolve, reject) => {
            var call = controllerProxy.CreateMonitor();
            call.fail((msg) => {
                console.log("Failed to create monitor for node '" + nodePath + "': " + msg);
                resolve();
            });
            call.done((monitorPath: string) => {
                subscribe(monitorPath);
                resolve();                
            });
        });
    }
}
