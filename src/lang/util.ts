export class Result<T, E extends Error = Error> {
    private constructor(
        private ok: boolean,
        private value: T | null,
        private error: E | null
    ) {}

    public static Ok = <T>(val: T): Result<T, any> => new Result(true, val, null);
    public static Err = <E extends Error>(err: E): Result<any, E> => new Result(false, null, err);

    // TODO: Add proper assert / check for null here
    public unwrap = (): T => {
        assert(this.value != null, "Couldn't unwrap result because it was null");
        return this.value!;
    }
    public unwrapErr = (): E => {
        assert(this.error != null, "Couldn't unwrap error from result because it was null");
        return this.error!;
    }

    public isOk = (): boolean => this.ok;
}

export const copy = <T = Object>(value: T): T => <T>{...value};

type Constructor<T> = new (...args: any[]) => T;
export const is = <T>(type: Constructor<T>, value: any): boolean => value instanceof type;

export const assert = (condition: boolean, msg: string): void => { 
    if (condition) return;

    alert(msg);

    throw new Error(msg);
}