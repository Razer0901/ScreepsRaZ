/* ===== Imports ===== */
import * as Kernel from "./kernel/kernel";
import {Init} from "./processes/init";
import {Test} from "./processes/test";

declare const global: any;    // Used to define command line functions

/**
 * Adds a TestProcess to the processList
 * @returns {TestProcess}
 */
global.addTest = (parentPid?: number) => {
    const process = new Test(0, parentPid || 0);
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

/**
 * Kill a process by pid
 * @param {number} pid
 * @returns {number} -1=fail, pid=success
 */
global.pkill = (pid: number) => {
    return Kernel.killProcess(pid);
};

global.pinit = () => {
    const process = new Init(0, 0);
    Kernel.addProcess(process);
    Kernel.storeProcessList();
    return process;
};
