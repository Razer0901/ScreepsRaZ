/* ===== Imports ===== */
import * as Kernel from "./kernel/kernel";
import {RoomManagementProcess} from "./processes/room-management-process";
import {TestProcess} from "./processes/test-process";

declare const global: any;    // Used to define command line functions

/**
 * Adds a TestProcess to the processList
 * @returns {TestProcess}
 */
global.addTest = (parentPid?: number) => {
    const process = new TestProcess(0, parentPid || 0);
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
global.kill = (pid: number) => {
    return Kernel.killProcess(pid);
};

global.initRoomManagement = () => {
    const process = new RoomManagementProcess(0, 0);
    Kernel.addProcess(process);
    Kernel.storeProcessList();
    return process;
};
