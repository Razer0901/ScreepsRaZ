import {TestProcess} from "./processes/test-process";
import * as Kernel from "./kernel/kernel";

declare var global: any;

global.addTestProcess = () => {
    const process = new TestProcess(0, 0);
    Kernel.addProcess(process);
    Kernel.storeProcessTable();
    return process;
};

global.printMessage = (message: string) => {
    console.log(message);
    return true;
};