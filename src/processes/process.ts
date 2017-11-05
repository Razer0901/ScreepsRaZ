import * as Kernel from "../kernel/kernel";
import {ProcessStatus} from "./process-status";

export abstract class Process{
    public pid: number;
    public parentPid: number;

    public status: ProcessStatus;
    public abstract className: string;

    public priority: number; //1-16
    public memory: any;

    protected kernel = Kernel;

    constructor(pid:number, parentPid:number, priority:number = 8, status:ProcessStatus = ProcessStatus.ALIVE){
        this.pid = pid;
        this.parentPid = parentPid;
        this.priority = priority;
        this.status = status;
        this.className = Object.getPrototypeOf(this).constructor.name;
    }

    // constructor(){
    //
    // }

    public abstract run():any;

    public stop() {
        this.kernel.killProcess(this.pid);
        return;
    }
}

export interface IsProcess {
    className?: string;
    new(pid:number, parentPid:number, status: ProcessStatus, priority: number, memory?: any): Process;
}

export const definitions: { [className: string]: IsProcess } = {};

export const processDecorator = (name: string) => {
    // ctor is the constructor of the class that this was called on
    return (ctor: IsProcess) => {
        definitions[name] = ctor;
    };
};