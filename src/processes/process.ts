/* ===== Imports ===== */
import * as Kernel from "../kernel/kernel";

/**
 * Main process class that defines a process
 */
export abstract class Process {
    public pid: number;                 // Process ID
    public parentPid: number;           // Process ID of parent process

    public status: ProcessStatus;       // Status of process
    public className: string;           // Type of process

    public priority: number;            // Priority level
    public memory: any;                 // Memory to run process

    constructor(pid: number, parentPid: number, memory?: any) {
        this.pid = pid;
        this.parentPid = parentPid;
        this.status = ProcessStatus.ALIVE;
        this.priority = 8;
        this.memory = memory || {};
        this.className = Object.getPrototypeOf(this).constructor.name;
    }

    // Implement this to be able to handle requests from other processes
    public messageAlert() {
        this.status = ProcessStatus.ALIVE;
    }

    // Implement this for each process
    public abstract run(): any;

    // Safely kill this process
    public stop() {
        Kernel.killProcess(this.pid);
        return;
    }
}

/**
 * Interface to make class reconstruction work
 */
export interface IsProcess {
    className?: string;
    new(pid: number, parentPid: number, memory?: any): Process;
}

/**
 * Map of all different types of processes
 * @type {{}}
 */
export const definitions: { [className: string]: IsProcess } = {};

/**
 * Add class to definitions
 * @param {string} className
 * @returns {constructor} of specified class
 */
export const processDecorator = (className: string) => {
    return (constructor: IsProcess) => {
        definitions[className] = constructor;
    };
};

export enum ProcessStatus {
    ALIVE = 0,
    DEAD = 1,
    SUSPENDED = 2
}
