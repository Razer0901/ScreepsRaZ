/* ===== Imports ===== */
import {Process, processDecorator} from "../process";

@processDecorator("CreepManager")                // Define as a type of process
export class CreepManager extends Process {
    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {
        this.memory = this.memory || {};
        this.memory.counter = this.memory.counter + 1 || 0;

        if (this.memory.counter % 5 === 0) {
            console.log(this.memory.roomID + " : Room process!");
        }

        return 0;
    }

    public processRequest(originPid: number, data: any) {
        console.log(originPid, data);
        const temp = "Spawn1";
        Game.spawns[temp].spawnCreep( [WORK, CARRY, MOVE], "Tila");
    }
}
