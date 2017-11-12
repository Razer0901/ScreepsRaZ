interface IMessage {
    data: any;
    originPid: number;
    timestamp: number;
}

interface ISpawnData {
    body: BodyPartConstant[];
    creepName: string;
    roomID: string;
}
