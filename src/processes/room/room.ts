/* ===== Imports ===== */
import * as Kernel from "../../kernel/kernel";
import {Process, processDecorator, ProcessStatus} from "../process";
import {Harvester} from "./harvester";

@processDecorator("Room")                // Define as a type of process
export class Room extends Process {
    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {
        const process = new Harvester(0, this.pid, {roomID: this.memory.roomID});
        Kernel.addProcess(process);
        Kernel.storeProcessList();

        this.status = ProcessStatus.SUSPENDED;

        return 0;
    }
}
