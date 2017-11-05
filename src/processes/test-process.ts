/* ===== Imports ===== */
import {Process} from "./process";
import {processDecorator} from "./process";

@processDecorator("TestProcess")                // Define as a type of process
export class TestProcess extends Process {
    // tslint:disable-next-line:member-access
    readonly className: string = "TestProcess";

    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {
        console.log(this.pid + " : Running test process!");
        return 0;
    }
}
