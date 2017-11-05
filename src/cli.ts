/* ===== Imports ===== */
import * as Kernel from "./kernel/kernel";
import {TestProcess} from "./processes/test-process";

declare const global: any;    // Used to define command line functions

/**
 * Adds a TestProcess to the processList
 * @returns {TestProcess}
 */
global.addTestProcess = () => {
    const process = new TestProcess(0, 0);
    Kernel.addProcess(process);
    Kernel.storeProcessList();
    return process;
};

/**
 * Test function for testing arguments
 * @param {string} message
 * @returns {string} message
 */
global.echo = (message: string) => {
    console.log(message);
    return message;
};
