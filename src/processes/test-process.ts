import {Process} from "./process";
import {processDecorator} from "./process";

@processDecorator("TestProcess")
export class TestProcess extends Process {
    // tslint:disable-next-line:member-access
    readonly className: string;

    public run(): number {
        console.log("Running test process!");
        return 0;
    }
}
