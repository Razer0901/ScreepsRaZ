import {definitions, Process} from "../processes/process";
import {ProcessStatus} from "../processes/process-status";

let processList: { [pid: string]: Process} = {}; // Dictionary of processes -> Key:pid, Value:process
let processQueue: Process[] = []; // List of processes; Populated every tick

const clear = function(){
    processList = {};
    processQueue = [];
};

//Gets an id that is not in use
//TODO: Loop back when MAX_PID is hit
let getFreePid = () => {
    Memory.pidCounter = Memory.pidCounter || 1; //Initialize pidCounter to 1 if it is undefined

    //Increment until one isn't in use
    while (getProcessById(Memory.pidCounter)) {
        Memory.pidCounter += 1;
    }

    return Memory.pidCounter;
};

export let getProcessMemory = (pid:number) => {
    Memory.processMemory = Memory.processMemory || {}; // Initializes processMemory list
    Memory.processMemory[pid] = Memory.processMemory[pid] || {}; // Initializes specific process's memory
    return Memory.processMemory[pid];
};

export let getProcessById = (pid:number) => processList[pid];

export let addProcess = function<T extends Process>(process:T){
    let pid = getFreePid();
    process.pid = pid;                                  // Assign PID
    processList[process.pid] = process;                 // Put it in the list of all processes
    Memory.processMemory[pid] = process.memory || {};   // Allocate/store memory

    return processList[process.pid];
};

export let killProcess = function(pid:number){
    if (pid === 0) {
        console.log("YOU CAN'T KILL PID 0");
        return -1;
    }

    processList[pid].status = ProcessStatus.DEAD;
    Memory.processMemory[pid] = undefined;

    // Kill child processes
    console.log("Killing child processes...");

    for (let otherPid in processList) {             // Loop through all processes
        const tempProcess = processList[otherPid];  // Store temp process
        if ((pid === parseInt(otherPid, 10)) && (tempProcess.status !== ProcessStatus.DEAD)) {
            killProcess(tempProcess.pid);
        }
    }
};

export let suspendProcess = function(pid:number){
    const tempProcess = processList[pid];
    if(tempProcess.status !== ProcessStatus.DEAD){
        tempProcess.status = ProcessStatus.SUSPENDED;
        return;
    }
};

export let storeProcessTable = function () {
    let aliveProcess = _.filter(_.values(processList),
        (p: Process) => p.status !== ProcessStatus.DEAD);

    Memory.processList = _.map(aliveProcess,
        (p: Process) => [p.pid, p.parentPid, p.className, p.priority, p.status]);
};

export let garbageCollection = function () {
    Memory.processMemory = _.pick(Memory.processMemory,
        (_: any, k: string) => (processList[k]));
};

export let run = function () {
    let process = processQueue.pop();
    while (process) {
        try {
            if (process.status === ProcessStatus.ALIVE) {
                process.run();
            }
        } catch (e) {
            console.log("Fail to run process:" + process.pid);
            console.log(e.message);
            console.log(e.stack);
        }

        process = processQueue.pop();
    }
};

export let loadProcessTable = function () {
    clear();
    Memory.processList = Memory.processList || [];
    let storedList = Memory.processList;
    for (let item of storedList) {
        let [pid, parentPID, className, priority, status] = item;
        try {

            let memory = getProcessMemory(pid);
            const process: Process = new definitions[className](pid, parentPID, priority > 1 ? priority -- : priority, status);
            process.memory = memory;
            processList[process.pid] = process;
            processQueue.push(process);
        } catch (e) {
            console.log("Error when loading:" + e.message);
            console.log(className);
        }
    }
    processQueue = _.sortBy(processQueue, (p: Process) => p.priority);
    // DUAL SORT: processQueue = _.sortByAll(processQueue, [(p: Process) => p.data.runOrderIndex, (p: Process) => p.data.runTime]);
    // MAYBE FASTER: processQueue.sort((a,b) => a.priority - b.priority)

};

// STORE Process

//Remake table and queue

// Storing table -> loop through table and only put in tuple of all of the non dead ones

//New process -> Get pid,