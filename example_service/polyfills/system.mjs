
/** System contains system-wide calls, such as wait or createRedis */
export class System {

    /** Waits for some time */
    static async wait(duration = 1) {
        return await new Promise(resolve => setTimeout(resolve, duration));
    }

}