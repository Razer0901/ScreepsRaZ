/* ===== Imports ===== */
import {Process, processDecorator} from "./process";

@processDecorator("RoomProcess")                // Define as a type of process
export class RoomProcess extends Process {
    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {
        this.memory = this.memory || {};
        this.memory.counter = this.memory.counter + 1 || 0;

        if (this.memory.counter % 5 === 0) {
            console.log(this.memory.roomID + " : Room process!");
        }

        return 0;
    }
}
