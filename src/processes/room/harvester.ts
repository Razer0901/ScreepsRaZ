/* ===== Imports ===== */
import * as Kernel from "../../kernel/kernel";
import {Process, processDecorator, ProcessStatus} from "../process";

@processDecorator("Harvester")                // Define as a type of process
export class Harvester extends Process {

    public memory: IHarvesterMemory;

    constructor(pid: number, parentPid: number, memory?: any) {
        super(pid, parentPid, memory);

        this.memory.creepList = this.memory.creepList || [];
    }

    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {
        this.processMessages();

        const tempList = this.memory.creepList;
        for (const tempCreepIndex in tempList) {
            const tempCreep = Game.creeps[tempList[tempCreepIndex]];
            if (tempCreep) {
                const target: Source | null = tempCreep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                if (target) {
                    if (tempCreep.harvest(target) === ERR_NOT_IN_RANGE) {
                        tempCreep.moveTo(target);
                    }
                }
            } else {
                const deadCreep = tempList[tempCreepIndex];
                const index = this.memory.creepList.indexOf(deadCreep);
                if (index > -1) {
                    this.memory.creepList.splice(index, 1);
                }
            }
        }

        if (this.memory.creepList.length <= 0) {
            const spawnRequest: ISpawnData = {
                body: [WORK, WORK, CARRY, MOVE],
                creepName: "C" + Game.time,
                roomID: this.memory.roomID
            };

            Kernel.sendMessage(this.getCreepManagerPid(), {
                data: spawnRequest,
                originPid: this.pid,
                timestamp: Game.time
            });
            this.status = ProcessStatus.SUSPENDED;
        }

        return 0;
    }

    private processMessages() {
        this.memory.creepList = this.memory.creepList || [];
        const tempMessages: IMessage[] = Kernel.getMessages(this.pid);
        for (const message in tempMessages) {
            this.memory.creepList.push(tempMessages[message].data.creepName);
        }
    }

    private getCreepManagerPid() {
        if (!this.memory.creepManagerPid) {
            this.memory.creepManagerPid = Kernel.getProcessByClass("CreepManager")[0];
        }
        return this.memory.creepManagerPid;
    }
}

interface IHarvesterMemory {
    creepList: string[];
    creepManagerPid: number;
    roomID: string;
}
