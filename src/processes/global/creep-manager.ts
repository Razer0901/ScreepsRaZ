/* ===== Imports ===== */
import {Process, processDecorator} from "../process";

@processDecorator("CreepManager")                // Define as a type of process
export class CreepManager extends Process {

    private requestQueue: any[];

    /**
     * Override run method to constantly print
     * @returns {number}
     */
    public run(): number {

        // const availableSpawns = _.filter(Game.spawns, (spawn: Spawn) => !spawn.spawning);
        //
        // while (this.requestQueue.length > 0) {
        //     const request: any = this.requestQueue.pop();
        //
        //     const potentialSpawns = _.indexBy(availableSpawns,
        //         (spawn: Spawn) => Game.map.findRoute(spawn.room.name, request.roomID).length);
        //     Game.spawns.[potentialSpawns[0]].spawnCreep(request.body, "Tila");
        // }

        // console.log(Game.map.findRoute("Spawn1", "sim").length);

        return 0;
    }

    public processRequest(data: any) {
        this.requestQueue = this.requestQueue || [];
        this.requestQueue.push(data);
    }
}
