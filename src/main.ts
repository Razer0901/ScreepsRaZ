import * as Kernel from "./kernel/kernel";
import './cli';

export function loop() {
    Kernel.loadProcessTable();
    Kernel.garbageCollection();
    Kernel.run();
    Kernel.storeProcessTable();
}
