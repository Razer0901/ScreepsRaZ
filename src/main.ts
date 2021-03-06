/* ===== Imports ===== */
import "./cli";
import "./kernel/constants";
import * as Kernel from "./kernel/kernel";

/**
 * Main Screeps loop
 */
export function loop() {
    Kernel.loadProcessList();       // Load all processes from memory
    Kernel.run();                   // Run processes
    Kernel.storeProcessList();      // Store processes
}
