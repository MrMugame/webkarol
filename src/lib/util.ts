

/* 
export type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E };

export const Ok = <T>(val: T): Result<T, any> => <Result<T, any>>({ ok: true, value: val });
export const Err = <E>(err: E): Result<any, E> => <Result<any, E>>({ ok: false, error: err });
 */

export class Result<T, E = Error> {
    private constructor(
        private ok: boolean,
        private value: T | null,
        private error: E | null
    ) {}

    public static Ok = <T>(val: T): Result<T, any> => new Result(true, val, null);
    public static Err = <E>(err: E): Result<any, E> => new Result(false, null, err);

    // TODO: Add proper assert / check for null here
    public unwrap = (): T => this.value!;
    public unwrap_err = (): E => this.error!;

    public isOk = (): boolean => this.ok;
}

export const copy = <T = Object>(value: T): T => <T>{...value};

type Constructor<T> = new (...args: any[]) => T;
export const is = <T>(type: Constructor<T>, value: any): boolean => value instanceof type;