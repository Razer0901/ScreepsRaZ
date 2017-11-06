/* ===== Imports ===== */
import * as Kernel from "../kernel/kernel";
import {Process, processDecorator, ProcessStatus} from "./process";
import {RoomProcess} from "./room-process";

@processDecorator("RoomManagementProcess")                // Define as a type of process
export class RoomManagementProcess extends Process {
    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {
        this.memory = this.memory || {};
        this.memory.rooms = this.memory.rooms || {};

        for (const room in Game.rooms) {
            const process = new RoomProcess(0, this.pid, {roomID: room});
            Kernel.addProcess(process);
            Kernel.storeProcessList();
            this.memory.rooms[room] = room;
        }

        this.status = ProcessStatus.SUSPENDED;

        return 0;
    }
}
