/**
 * type for App
 * @public
 */
export declare class App implements IApp {
    init(): Promise<void>;
}

declare interface IApp {
    init: () => void;
}

export { }
