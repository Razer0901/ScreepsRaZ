/* ===== Imports ===== */
import * as Kernel from "../../kernel/kernel";
import {CreepStatus, ICreep} from "../global/creep-manager";
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

        const tempList = _.filter(this.memory.creepList, (creep: ICreep) => creep.status === CreepStatus.READY);
        for (const tempCreepIndex in tempList) {
            const tempCreep = Game.creeps[tempList[tempCreepIndex].creepName];
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

        this.spawnCreep();

        return 0;
    }

    private spawnCreep() {
        console.log("Before" + this.memory.creepList.length);
        if (this.memory.creepList.length < 3) {

            if (this.memory.creepList.length <= 0) {
                this.status = ProcessStatus.SUSPENDED;
            }

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

            const tempCreep: ICreep = {
                creepName: spawnRequest.creepName,
                status: CreepStatus.IN_QUEUE
            };

            this.memory.creepList.push(tempCreep);
            console.log("after" + this.memory.creepList.length);
        }
    }

    private processMessages() {
        this.memory.creepList = this.memory.creepList || [];
        const tempMessages: IMessage[] = Kernel.getMessages(this.pid);
        for (const message in tempMessages) {
            const index = _.find(this.memory.creepList, (creep: ICreep) => {
                return creep.creepName === tempMessages[message].data.creepName;
            });
            if (index) {
                index.status = CreepStatus.READY;
            }
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
    creepList: ICreep[];
    creepManagerPid: number;
    roomID: string;
}
