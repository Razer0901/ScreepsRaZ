/* ===== Imports ===== */
import {Process} from "./process";
import {processDecorator} from "./process";

@processDecorator("TestProcess")                // Define as a type of process
export class TestProcess extends Process {
    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {
        this.memory = this.memory || {};
        this.memory.counter = this.memory.counter + 1 || 0;

        if (this.memory.counter % 5 === 0) {
            console.log(this.pid + " : Running test process!");
        }

        return 0;
    }
}
