/* ===== Imports ===== */
import * as Kernel from "../../kernel/kernel";
import {Process, processDecorator, ProcessStatus} from "../process";

@processDecorator("Hauler")                // Define as a type of process
export class Hauler extends Process {

    public memory: IHaulerMemory;

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
                if (_.sum(tempCreep.carry) === 0) {
                    const droppedLocation: Resource<ResourceConstant> | null = tempCreep.pos.
                        findClosestByRange(FIND_DROPPED_RESOURCES);
                    if (droppedLocation) {
                        if (tempCreep.pickup(droppedLocation) === ERR_NOT_IN_RANGE) {
                            tempCreep.moveTo(droppedLocation);
                        }
                    }
                } else {
                    const spawnLocation = _.filter(Game.spawns, (spawn: Spawn) =>
                        spawn.room.name === this.memory.roomID)[0];
                    if (spawnLocation.energy !== spawnLocation.energyCapacity) {
                        if (tempCreep.transfer(spawnLocation, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            tempCreep.moveTo(spawnLocation);
                        }
                    } else {
                        const controllerLocation: StructureController | undefined = Game.
                            rooms[this.memory.roomID].controller;
                        if (controllerLocation) {
                            if (tempCreep.upgradeController(controllerLocation) === ERR_NOT_IN_RANGE) {
                                tempCreep.moveTo(controllerLocation);
                            }
                        }
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
                body: [CARRY, CARRY, MOVE, WORK],
                creepName: "HL" + Game.time,
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

interface IHaulerMemory {
    creepList: string[];
    creepManagerPid: number;
    roomID: string;
}
