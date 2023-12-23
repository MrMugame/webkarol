import { Span } from "./tokens";

class Result<T, E extends Error = Error> {
    private constructor(
        private ok: boolean,
        private value: T | null,
        private error: E | null
    ) {}

    public static Ok = <T>(val: T): Result<T, any> => new Result(true, val, null);
    public static Err = <E extends Error>(err: E): Result<any, E> => new Result(false, null, err);

    public unwrap(): T {
        assert(this.value != null, "Couldn't unwrap result because it was null");
        return this.value!;
    }
    public unwrapErr(): E {
        assert(this.error != null, "Couldn't unwrap error from result because it was null");
        return this.error!;
    }

    public isOk = (): boolean => this.ok;
}

const flatten = <T, E extends Error>(result: Result<Result<T, E>, E>): Result<T, E> => {
    if (result.isOk()) return result.unwrap();
    else return Result.Err(result.unwrapErr());
}


const copy = <T = Object>(value: T): T => <T>{...value};

type Constructor<T> = new (...args: any[]) => T;
const is = <T>(type: Constructor<T>, value: any): value is T => value instanceof type;

const assert = (condition: boolean, msg: string): void => {
    if (condition) return;

    alert(msg);

    throw new Error(msg);
}

class KarolError extends Error {
    private location: Span;

    constructor(message: string, location: Span) {
        super(message);
        this.name = "KarolError";
        this.location = location;
    }

    toString(): string {
        return `${this.message} (in Zeile ${this.location.start.line} und Spalte ${this.location.start.column})`
    }
}

export { Result, KarolError, copy, is, assert, flatten }