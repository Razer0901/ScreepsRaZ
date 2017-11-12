/* ===== Imports ===== */
import * as Kernel from "../../kernel/kernel";
import {Process, processDecorator, ProcessStatus} from "../process";
import {Harvester} from "./harvester";
import {Hauler} from "./hauler";

@processDecorator("Room")                // Define as a type of process
export class Room extends Process {
    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {
        const harvesterProcess = new Harvester(0, this.pid, {roomID: this.memory.roomID});
        Kernel.addProcess(harvesterProcess);
        Kernel.storeProcessList();

        const haulerProcess = new Hauler(0, this.pid, {roomID: this.memory.roomID});
        Kernel.addProcess(haulerProcess);
        Kernel.storeProcessList();

        this.status = ProcessStatus.SUSPENDED;

        return 0;
    }
}
