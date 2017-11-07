/* ===== Imports ===== */
import * as Kernel from "../kernel/kernel";
import {CreepManager} from "./global/creep-manager";
import {RoomManager} from "./global/room-manager";
import {Process, processDecorator, ProcessStatus} from "./process";

@processDecorator("Init")                // Define as a type of process
export class Init extends Process {
    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {
        const creepManager = new CreepManager(0, this.pid);
        Kernel.addProcess(creepManager);
        Kernel.storeProcessList();

        const roomManager = new RoomManager(0, this.pid);
        Kernel.addProcess(roomManager);
        Kernel.storeProcessList();

        this.status = ProcessStatus.SUSPENDED;

        return 0;
    }
}
