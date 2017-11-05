declare namespace NodeJS {
    interface Global {
        log: any;
        myTestFunction: () => void;
        myfunc: (message:string) => boolean;
    }
}