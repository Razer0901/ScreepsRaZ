/* ===== Imports ===== */
import * as Kernel from "../kernel/kernel";
import {ProcessStatus} from "./process-status";

/**
 * Main process class that defines a process
 */
export abstract class Process {
    public pid: number;                 // Process ID
    public parentPid: number;           // Process ID of parent process

    public status: ProcessStatus;       // Status of process
    public abstract className: string;  // Type of process

    public priority: number;            // Priority level
    public memory: any;                 // Memory to run process

    protected kernel = Kernel;          // Kernel process is running on

    constructor(pid: number, parentPid: number, memory?: any) {
        this.pid = pid;
        this.parentPid = parentPid;
        this.priority = 8;
        this.status = ProcessStatus.ALIVE;
        this.memory = memory;
        this.className = Object.getPrototypeOf(this).constructor.name;
    }

    // Implement this for each process
    public abstract run(): any;

    // Safely kill this process
    public stop() {
        this.kernel.killProcess(this.pid);
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
