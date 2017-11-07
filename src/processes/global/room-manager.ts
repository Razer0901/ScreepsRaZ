/* ===== Imports ===== */
import * as Kernel from "../../kernel/kernel";
import {Process, processDecorator, ProcessStatus} from "../process";
import {Room} from "../room/room";

@processDecorator("RoomManager")                // Define as a type of process
export class RoomManager extends Process {
    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {
        this.memory = this.memory || {};
        this.memory.rooms = this.memory.rooms || {};

        for (const room in Game.rooms) {
            const process = new Room(0, this.pid, {roomID: room});
            this.memory.rooms[room] = Kernel.addProcess(process).pid;
            Kernel.storeProcessList();
        }

        this.status = ProcessStatus.SUSPENDED;

        return 0;
    }
}
