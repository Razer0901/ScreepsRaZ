/* ===== Imports ===== */
import * as Kernel from "../../kernel/kernel";
import {Process, processDecorator} from "../process";

@processDecorator("CreepManager")                // Define as a type of process
export class CreepManager extends Process {

    public memory: ICreepManagerMemory;
    private tempMessages: IMessage[];
    private availableSpawns: StructureSpawn[] = [];

    constructor(pid: number, parentPid: number, memory?: any) {
        super(pid, parentPid, memory);

        this.memory.requestQueue = this.memory.requestQueue || [];
        this.memory.spawning = this.memory.spawning || [];
        this.availableSpawns = _.filter(Game.spawns, (spawn: Spawn) => !spawn.spawning);
    }

    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {
        this.processMessages();
        this.tempMessages = this.tempMessages.concat(this.memory.requestQueue);

        while (this.tempMessages.length > 0) {

            if (this.processSingleMessage() === -1) {
                break;
            }
        }

        this.memory.requestQueue = this.tempMessages;

        this.checkSpawns();

        return 0;
    }

    private processSingleMessage(): number {
        if (_.size(this.availableSpawns) >= 0) {
            const message: IMessage | undefined = this.tempMessages.shift();
            if (message) {
                const possibleSpawns = _.filter(this.availableSpawns, (spawn: Spawn) => {
                    return spawn.spawnCreep(message.data.body, message.data.creepName, { dryRun: true }) === 0;
                });

                if (_.size(possibleSpawns) <= 0) {
                    this.tempMessages.unshift(message);
                    return -1;
                }

                const orderedSpawns = _.indexBy(possibleSpawns, (spawn: Spawn) => {
                    const route = Game.map.findRoute(spawn.room, message.data.roomID);
                    return route instanceof Number ? Infinity : route.length;
                });

                const spawnCode =
                    Game.spawns[orderedSpawns[0].name].spawnCreep(message.data.body, message.data.creepName);
                if (spawnCode === 0) {
                    const index = this.availableSpawns.indexOf(orderedSpawns[0]);
                    if (index > -1) {
                        this.availableSpawns.splice(index, 1);
                    }
                }

                console.log("Spawning " + message.data.creepName + " : " + spawnCode);

                this.memory.spawning = this.memory.spawning || [];
                this.memory.spawning.push(message);
            }
            return 0;
        } else {
            return -1;
        }
    }

    private checkSpawns() {
        const tempSpawningList = this.memory.spawning;
        for (const spawn in tempSpawningList) {
            const tempMessage: IMessage = tempSpawningList[spawn];
            if (!Game.creeps[tempMessage.data.creepName].spawning) {
                const returnMessage: IMessage = {
                    data: tempMessage.data,
                    originPid: this.pid,
                    timestamp: Game.time
                };
                const index = this.memory.spawning.indexOf(tempMessage);
                if (index > -1) {
                    this.memory.spawning.splice(index, 1);
                }
                Kernel.sendMessage(tempMessage.originPid, returnMessage);
            }
        }
    }

    private processMessages() {
        this.tempMessages = [];
        this.tempMessages = Kernel.getMessages(this.pid);
    }
}

interface ICreepManagerMemory {
    requestQueue: IMessage[];
    spawning: IMessage[];
}

export enum CreepStatus {
    IN_QUEUE = 1,
    READY = 2
}

export interface ICreep {
    creepName: string;
    status: CreepStatus;
}
