/**
 * To make syntax highlighting work...
 */
interface Memory {
    processList: any;
    pidCounter: number;
    messages: {[name: string]: IMessage[]};
}
