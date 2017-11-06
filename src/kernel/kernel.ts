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

    // Kill child processes
    console.log("Killing children of process " + pid + " ...");

    for (const otherPid in processList) {                       // Loop through all processes
        const tempProcess = processList[otherPid];              // Store temp process
        if ((pid === tempProcess.parentPid)
            && (tempProcess.status !== ProcessStatus.DEAD)) {   // Check if process is a child
            killProcess(tempProcess.pid);                       // Kill child process (recursion)
        }
    }
    return pid;
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
 * Stores process list to Memory and omits dead processes
 */
export let storeProcessList = () => {
    const aliveProcess = _.filter(_.values(processList),
        (p: Process) => p.status !== ProcessStatus.DEAD);   // Filter out dead processes

    Memory.processList = _.indexBy(aliveProcess, (p: Process) => p.pid);
};

/**
 * Load the processList from memory
 */
export let loadProcessList = () => {
    clear();                                        // Clear variables
    Memory.processList = Memory.processList || [];  // Init processlist in memory
    const storedList = Memory.processList;          // Holds a cache of the processList in memory

    // Load from memory
    for (const pid in storedList) {
        const tempProcess = storedList[pid];
        try {
            const process: Process =
                new definitions[tempProcess.className](parseInt(pid, 10), tempProcess.parentPid, tempProcess.memory);
            process.priority = tempProcess.priority;
            process.status = tempProcess.status;
            processList[process.pid] = process;
            processQueue.push(process);
        } catch (e) {
            console.log("Error when loading:" + e.message);
            console.log(tempProcess.className);
        }
    }

    // Sort processQueue by priority
    processQueue.sort((a, b) => b.priority - a.priority);

    /*
    DUAL SORT:
        processQueue.sortByAll(processQueue, [(p: Process) => p.data.runOrderIndex, (p: Process) => p.data.runTime]);
     */
};
