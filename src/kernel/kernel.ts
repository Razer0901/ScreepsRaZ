/* ===== Imports ===== */
import {definitions, Process} from "../processes/process";
import {ProcessStatus} from "../processes/process-status";

let processList: { [pid: string]: Process} = {};    // Dictionary of processes => Key:pid, Value:process
let processQueue: Process[] = [];                   // List of processes; Populated every tick

/**
 * Clears processList and processQueue variables so they can be re-populated
 */
const clear = () => {
    processList = {};
    processQueue = [];
};

/**
 * Next process ID based on Memory.pidCounter which increments every request
 * NOTE: Does not check for overlap (not necessary unless one tries to start loop with processes running)
 * @return {number} pid
 */
const getFreePid = () => {
    return Memory.pidCounter = (Memory.pidCounter || 0) + 1;
};

/**
 * Recalls data responsible for specific process from memory
 * @param {number} pid
 * @returns {any}
 */
export let getProcessMemory = (pid: number) => {
    Memory.processMemory = Memory.processMemory || {};              // Init processMemory list if it doesn't exists
    Memory.processMemory[pid] = Memory.processMemory[pid] || {};    // Init process's memory list if it doesn't exists
    return Memory.processMemory[pid];
};

/**
 * Looks up process by pid from list
 * @param {number} pid
 * @return {Process} process
 */
export let getProcessById = (pid: number) => processList[pid];

/**
 * Adds a process to the processList (allocates required memory and assigns pid)
 * @param {Process} process
 * @returns {Process} process (with pid and memory initialized)
 */
export let addProcess = <T extends Process>(process: T) => {
    const pid = getFreePid();                           // Grab valid PID
    process.pid = pid;                                  // Assign PID
    processList[process.pid] = process;                 // Add to list of processes
    Memory.processMemory[pid] = process.memory || {};   // Allocate/store memory

    return processList[process.pid];
};

/**
 * Kills process and child processes
 * @param {number} pid
 * @returns {number} -1=fail, pid=success
 */
export let killProcess = (pid: number) => {
    // Prevents killing of all processes
    if (pid === 0) {
        console.log("Good try :P You can't kill process 0!");
        return -1;
    }

    // Kills current process and resets memory
    processList[pid].status = ProcessStatus.DEAD;
    Memory.processMemory[pid] = undefined;

    // Kill child processes
    console.log("Killing children of process " + pid + " ...");

    for (const otherPid in processList) {                       // Loop through all processes
        const tempProcess = processList[otherPid];              // Store temp process
        if ((pid === parseInt(otherPid, 10))
            && (tempProcess.status !== ProcessStatus.DEAD)) {   // Check if process is a child
            killProcess(tempProcess.pid);                       // Kill child process (recursion)
        }
    }
};

/**
 * Suspends a process by pid
 * @param {number} pid
 * @returns {number} -1=fail, pid=success
 */
export let suspendProcess = (pid: number) => {
    const tempProcess = processList[pid];               // Store temp process
    if (tempProcess.status !== ProcessStatus.DEAD) {    // Check if process is dead
        tempProcess.status = ProcessStatus.SUSPENDED;   // Suspend process
        return pid;
    } else {
        console.log("Process " + pid + " is already dead.");
        return -1;
    }
};

/**
 * Stores process list to Memory and omits dead processes
 */
export let storeProcessList = () => {
    const aliveProcess = _.filter(_.values(processList),
        (p: Process) => p.status !== ProcessStatus.DEAD);   // Filter out dead processes

    Memory.processList = _.map(aliveProcess,
        (p: Process) => [p.pid, p.parentPid, p.className, p.priority, p.status]);   // Save to Memory
};

/**
 * Filter and cleans Memory of unused process memory
 */
export let garbageCollection = () => {
    Memory.processMemory = _.pick(Memory.processMemory, (_: any, k: string) => (processList[k]));
};

/**
 * Runs processes
 */
export let run = () => {
    // Loops through all processes and run the ones that are alive
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

/**
 * Load the processList from memory
 */
export let loadProcessList = () => {
    clear();    // Clear variables
    Memory.processList = Memory.processList || [];  // Init processlist in memory
    const storedList = Memory.processList;          // Holds a cache of the processList in memory

    // Loops through processes
    for (const item of storedList) {
        const [pid, parentPID, className, priority, status] = item;
        try {
            const memory = getProcessMemory(pid);
            const process: Process =
                new definitions[className](pid, parentPID, priority, status);
            process.memory = memory;
            processList[process.pid] = process;
            processQueue.push(process);
        } catch (e) {
            console.log("Error when loading:" + e.message);
            console.log(className);
        }
    }

    // Sort processQueue by priority
    processQueue.sort((a, b) => b.priority - a.priority);
    /*
    DUAL SORT:
        processQueue.sortByAll(processQueue, [(p: Process) => p.data.runOrderIndex, (p: Process) => p.data.runTime]);
     */
};
