import { Color, Rotation, World } from "../ui/view/world";
import { CallStmt, CondDecl, CondLoopStmt, CondStmt, Decl, FuncDecl, IfStmt, InftyLoopStmt, IterLoopStmt, ProgDecl, Stmt, TruthStmt } from "./ast";
import { KarolError, Result, assert, flatten, is } from "./util";

const colors: Map<string, Color> = new Map([
    ["rot", Color.Red],
    ["gelb", Color.Yellow],
    ["blau", Color.Blue],
    ["grün", Color.Green],
    ["schwarz", Color.Black]
]);

type WorldFunction<T> = {takesColor: false, takesNum: false, func: (w: World) => T}
    | {takesColor: true, takesNum: false, func: (w: World, color: Color | null) => T}
    | {takesColor: false, takesNum: true, func: (w: World, num: number | null) => T}
    | {takesColor: true, takesNum: true, func: (w: World, color: Color | null, num: number | null) => T};

// TODO: Handle black
// TODO: IstVoll, NichtIstVoll, IstLeer, NichtIstLeer, HatZiegel, HatZiegel(Anzahl)
const conditions: Map<string, WorldFunction<boolean>> = new Map([
    ["istwand",        { takesColor: false, takesNum: false, func: (w: World) => w.isWall()}],
    ["nichtistwand",   { takesColor: false, takesNum: false, func: (w: World) => !w.isWall()}],
    ["istziegel",      { takesColor: true,  takesNum: true,  func: (w: World, color: Color | null, num: number | null) => w.isBrick(num, color)}],
    ["nichtistziegel", { takesColor: true,  takesNum: true,  func: (w: World, color: Color | null, num: number | null) => !w.isBrick(num, color)}],
    ["istmarke",       { takesColor: true,  takesNum: false, func: (w: World, color: Color | null) => w.isMark(color)}],
    ["nichtistmarke",  { takesColor: true,  takesNum: false, func: (w: World, color: Color | null) => !w.isMark(color)}],
    ["istnorden",      { takesColor: false, takesNum: false, func: (w: World) => w.isRotation(Rotation.North)}],
    ["istosten",       { takesColor: false, takesNum: false, func: (w: World) => w.isRotation(Rotation.East)}],
    ["istsüden",       { takesColor: false, takesNum: false, func: (w: World) => w.isRotation(Rotation.South)}],
    ["istwesten",      { takesColor: false, takesNum: false, func: (w: World) => w.isRotation(Rotation.West)}],
]);

const repeat = (func: () => Result<null>, num: number | null): Result<null> => {
    for (let i = 0; i < (num ?? 1); i++) {
        let res = func();
        if (!res.isOk()) return res;
    }

    return Ok(null);
}
const commands: Map<string, WorldFunction<Result<null>>> = new Map([
    ["schritt",      { takesColor: false, takesNum: true,  func: (w: World, num: number | null) => repeat(w.step.bind(w), num)}],
    ["linksdrehen",  { takesColor: false, takesNum: false, func: (w: World) => { w.rotateLeft(); return Ok(null); }}],
    ["rechtsdrehen", { takesColor: false, takesNum: false, func: (w: World) => { w.rotateRight(); return Ok(null); }}],
    ["hinlegen",     { takesColor: true,  takesNum: true,  func: (w: World, color: number | null, num: Color | null) => repeat(() => w.placeBrick(color), num)}],
    ["aufheben",     { takesColor: false, takesNum: true,  func: (w: World, num: number | null) => repeat(w.pickupBrick.bind(w), num)}],
    ["markesetzen",  { takesColor: true,  takesNum: false, func: (w: World, color: Color | null) => { w.setMark(color); return Ok(null); }}],
    ["markelöschen", { takesColor: false, takesNum: false, func: (w: World) => { w.removeMark(); return Ok(null); }}],
    // TODO: ["warten", { takesColor: false, takesNum: true, func: (w: World, num: number | null) => w.wait(num)}],
    // TODO: Beenden
    ["ton", { takesColor: false, takesNum: false, func: (w: World) => { w.beep(); return Ok(null); }}]
]);

const Err = Result.Err, Ok = Result.Ok;
type RuntimeResult<T> = Result<T, KarolError>;

export class Interpreter {
    // State variable used when executing a CondDecl
    // Not the nicest solution but hey it works
    private insideCond = false; // TODO: I think the real karol does some kind of sema to check this. Maybe we should too?
    private state = false;

    constructor(private readonly code: Decl[], readonly world: World, readonly callback: (line: number) => void) {}

    public *interpret(): Generator<void, RuntimeResult<null>, undefined> {
        let programNode = this.code.find(x => is(ProgDecl, x));
        //if (programNode == undefined) return Err(new KarolError("Karol konnte kein Einstiegspunkt finden", this.code[0].position));
        assert(programNode !== undefined, "Karol couldn't find programNode");

        let res = yield* this.executeStmts(programNode!.body);
        if (!res.isOk()) return res;

        return Ok(null);
    }

    private *executeStmts(stmts: Stmt[]): Generator<void, RuntimeResult<null>, undefined> {
        for (let stmt of stmts) {
            let res = yield* this.executeStmt(stmt);
            if (!res.isOk()) return res;
        }

        return Ok(null);
    }

    private *executeStmt(stmt: Stmt): Generator<void, RuntimeResult<null>, undefined> {
        this.callback(stmt.position.start.line);

        // Stmt, CondLoopStmt, IterLoopStmt, InftyLoopStmt, IfStmt, CallStmt, CondStmt
        if (is(CondLoopStmt, stmt)) {
            while (true) {
                let res = yield* this.executeCond(stmt.cond);
                if (!res.isOk()) return Err(res.unwrapErr());
                if (!res.unwrap()) break;

                let res_ = yield* this.executeStmts(stmt.body);
                if (!res_.isOk()) return res_;
            }
        } else if (is(IterLoopStmt, stmt)) {
            for (let i = 0; i < stmt.iterations; i++) {
                let res = yield* this.executeStmts(stmt.body);
                if (!res.isOk()) return res;
            }
        } else if (is(InftyLoopStmt, stmt)) {
            while (true) {
                let res = yield* this.executeStmts(stmt.body);
                if (!res.isOk()) return res;
            }
        } else if (is(IfStmt, stmt)) {
            let res = yield* this.executeCond(stmt.cond);
            if (!res.isOk()) return Err(res.unwrapErr());

            if (res.unwrap()) {
                let res = yield* this.executeStmts(stmt.body);
                if (!res.isOk()) return res;
            } else if (stmt.else_ !== null) {
                let res = yield* this.executeStmts(stmt.else_);
                if (!res.isOk()) return res;
            }
        } else if (is(CallStmt, stmt)) {
            let callback = commands.get(stmt.name.toLowerCase());
            if (callback !== undefined) {
                let res = flatten(this.executeInternalCallback(callback, stmt.parameter));
                if (!res.isOk()) return Err(new KarolError(res.unwrapErr().message, stmt.position));
                yield;
            } else {
                let decl = this.code.find(x => is(FuncDecl, x) && x.name === stmt.name);
                if (decl === undefined) return Err(new KarolError("Karol konnte die aufgerufene Anweisung nicht finden", stmt.position));
                let res = yield* this.executeStmts(decl.body);
                if (!res.isOk()) return res;
            }
        } else if (is(TruthStmt, stmt)) {
            if (!this.insideCond) return Err(new KarolError("Karol kann wahr und falsch nur in Bedingungen nutzen", stmt.position));
            this.state = stmt.value;
        } else return Err(new KarolError("Karol ist auf einen unbekannten Fehler getroffen", stmt.position));

        return Ok(null);
    }

    private *executeCond(cond: CondStmt): Generator<void, RuntimeResult<boolean>, undefined> {
        let truthy = false;

        let callback = conditions.get(cond.name.toLowerCase());
        if (callback !== undefined) {
            let res = this.executeInternalCallback(callback, cond.parameter);
            if (!res.isOk()) return Err(new KarolError(res.unwrapErr().message, cond.position));
            truthy = res.unwrap();
        } else {
            let decl = this.code.find(x => is(CondDecl, x) && x.name == cond.name);
            if (decl === undefined) return Err(new KarolError("Karol konnte die aufgerufene Bedingung nicht finden", cond.position));

            this.insideCond = true;
            this.state = false;

            let res = yield* this.executeStmts(decl.body);
            if (!res.isOk()) return Err(res.unwrapErr());

            this.insideCond = false;
            truthy = this.state;
        }

        return Ok(cond.not ? !truthy : truthy);
    }

    private executeInternalCallback<T>(callback: WorldFunction<T>, parameter: string | number | null): Result<T> {
        if (!callback.takesColor && typeof parameter === "string") return Err(new Error("Die aufgerufene Anweisung nimmt keine Farben"));
        else if (!callback.takesNum && typeof parameter === "number") return Err(new Error("Die aufgerufene Anweisung nimmt keine Zahl"));

        let number: number | null = typeof parameter === "number" ? parameter : null;

        let color: Color | null = null;
        if (typeof parameter === "string") {
            let element = colors.get(parameter);
            if (element !== undefined) color = element;
            else return Err(new Error("Karol konnte die angegebene Farbe nicht finden"));
        }

        if (!callback.takesColor && !callback.takesNum) {
            return Ok(callback.func(this.world));
        } else if (callback.takesColor && !callback.takesNum) {
            return Ok(callback.func(this.world, color));
        } else if (!callback.takesColor && callback.takesNum) {
            return Ok(callback.func(this.world, number));
        } else { //if (callback.takesColor && callback.takesNum) {
            return Ok(callback.func(this.world, color, number));
        }
    }
}