/* ===== Imports ===== */
import * as Kernel from "../../kernel/kernel";
import {Process, processDecorator, ProcessStatus} from "../process";

@processDecorator("Harvester")                // Define as a type of process
export class Harvester extends Process {
    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {
        Kernel.sendRequest(this.getCreepManagerPid(), this.pid, {});

        this.status = ProcessStatus.SUSPENDED;

        return 0;
    }

    private getCreepManagerPid() {
        if (!this.memory.creepManagerPid) {
            this.memory.creepManagerPid = Kernel.getProcessByClass("CreepManager")[0];
        }
        return this.memory.creepManagerPid;
    }
}
