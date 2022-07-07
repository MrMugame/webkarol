import { World } from "../graphics/world";
import { RuntimeError } from "./error";
import { CallNode, CaseLoopNode, CaseNode, ConditionMacroNode, LoopNode, MacroNode, Node, ProgramNode, SpecialCallNode } from "./nodes";
import { Position, State } from "./types";




export class Interpreter {
    private macroStore: MacroNode[];
    private conditionStore: ConditionMacroNode[];
    private programNode: ProgramNode | null;

    constructor(private world: World, nodes: Node[]) {
        this.macroStore = [];
        this.conditionStore = [];
        this.programNode = null;

        for (let node of nodes) {
            if (node instanceof MacroNode) {
                this.macroStore.push(node);
            } else if (node instanceof ConditionMacroNode) {
                this.conditionStore.push(node);
            } else if (node instanceof ProgramNode) {
                this.programNode = node;
            } 
        }

        if (!(this.programNode instanceof ProgramNode)) {
            let buffer: Node[] = [];

            for (let node of nodes) {
                if (!(node instanceof MacroNode) && !(node instanceof ConditionMacroNode)) {
                    buffer.push(node);
                }
            }

            if (buffer.length > 0) {
                this.programNode = new ProgramNode(buffer, buffer[0].posStart.copy(),(buffer.at(-1)?.posEnd?.copy()) || buffer[0].posStart.copy())
            }
        }
    }

    public* run(): Generator<State | Boolean, RuntimeError | State | Boolean, any> {
        if (this.programNode != null) {
            const res = yield* this.interpret([this.programNode]);
            return res;
        } else {
            let pos = new Position(0,0,0,"");
            return new RuntimeError(pos, pos,"Unerwartetes Wort nach wiederhole")
        }
    }

    private* interpret(nodes: Node[]): Generator<State | Boolean, RuntimeError | State | Boolean, any> {
        for (const current of nodes) {
            if (current instanceof ProgramNode)  {
                yield* this.interpret(current.body);
            } else if (current instanceof ConditionMacroNode) {
                let truthness = false;
                for (let n of this.interpret(current.body)) {
                    if (n === true) {
                        truthness = true;
                        yield State.Running;
                    } else if (n === false) {
                        truthness = false;
                        yield State.Running;
                    }
                    yield n;
                }
                return truthness;
            } else if (current instanceof MacroNode) {
                yield* this.interpret(current.body);
            } else if (current instanceof CallNode) {
                const res = this.executeCall(current.name);
                if (res instanceof RuntimeError) {
                    res.posStart = current.posStart.copy();
                    res.posEnd = current.posEnd.copy();
                    return res;
                }
                if (res instanceof MacroNode) {
                    yield* this.interpret([res]);
                    continue;
                }
                yield res
            } else if (current instanceof SpecialCallNode) {
                yield current.name === "wahr" ? true : false;
            } else if (current instanceof LoopNode) {
                for (let i = 0; i < current.iterations; i++) {
                    yield* this.interpret(current.body);
                }
            } else if (current instanceof CaseNode) {
                let res = this.checkCondition(current.condition.condition);
                if (res instanceof RuntimeError) {
                    res.posStart = current.posStart.copy();
                    res.posEnd = current.posEnd.copy();
                    return res;
                }

                if (res instanceof ConditionMacroNode) {
                    const val = yield* this.interpret([res]);
                    if (val instanceof RuntimeError) return val
                    if (val === true || val === false) {
                        res = val;
                    } else {
                        return val;
                    }
                }

                
                if (res) {
                    yield* this.interpret(current.body);
                } else {
                    yield* this.interpret(current.notBody);
                }

            } else if (current instanceof CaseLoopNode) {
                while (true) {
                    let res = this.checkCondition(current.condition.condition);
                    if (res instanceof RuntimeError) {
                        res.posStart = current.posStart.copy();
                        res.posEnd = current.posEnd.copy();
                        return res;
                    }

                    if (res instanceof ConditionMacroNode) {
                        const val = yield* this.interpret([res]);
                        if (val instanceof RuntimeError) return val
                        if (val === true || val === false) {
                            res = val;
                        } else {
                            return val;
                        }
                    }

                    if (!res) break;

                    yield* this.interpret(current.body)
                }
            }
        }

        return State.Finished
    }

    private executeCall(name: string): MacroNode | RuntimeError | State {
        let err: RuntimeError | State | void = State.Running;
    
        if (name === "Schritt") {
            err = this.world.step();
        } else if (name === "RechtsDrehen") {
            err = this.world.rotateRight();
        } else if (name === "LinksDrehen") {
            err = this.world.rotateLeft();
        } else if (name === "Hinlegen") {
            err = this.world.drop();
        } else if (name === "MarkeSetzen") {
            err = this.world.setMark();
        } else if (name === "MarkeLöschen") {
            err = this.world.deleteMark();
        } else if (name === "Schnell") {
            err = this.world.fast();
        } else if (name === "Langsam") {
            err = this.world.slow();
        } else if (name === "Ton") {
            err = this.world.sound();
        } else if (name === "Aufheben") {
            err = this.world.pickup();
        } else if (name === "Beenden") {
            err = State.Killed;
        } else {
            for (let macro of this.macroStore) {
                if (macro.name === name) {
                    return macro
                }
            }
            //err = new FunctionNotFoundError();
            return new RuntimeError(new Position(0,0,0,""), new Position(0,0,0,""), "Konnte Funktion nicht finden");
        }
    
        err = State.Running;
    
        return err
    }

    private checkCondition(condition: string): ConditionMacroNode | RuntimeError | Boolean {
        let truthness: Boolean;
    
        if (condition === "IstZiegel") {
            truthness = this.world.isbrick();
        } else if (condition === "NichtIstZiegel") {
            truthness = !(this.world.isbrick());
        } else if (condition === "IstWand") {
            truthness = this.world.iswall();
        } else if (condition === "NichtIstWand") {
            truthness = !(this.world.iswall());
        } else if (condition === "IstMarke") {
            truthness = this.world.ismark();
        } else if (condition === "NichtIstMarke") {
            truthness = !(this.world.ismark());
        } else if (condition === "IstNorden") {
            truthness = Math.sin(this.world.getrot()) == -1;
        } else if (condition === "IstSüden") {
            truthness = Math.sin(this.world.getrot()) == 1;
        } else if (condition === "IstWesten") {
            truthness = Math.cos(this.world.getrot()) == -1;
        } else if (condition === "IstOsten") {
            truthness = Math.cos(this.world.getrot()) == 1;
        } else {
            for (let macro of this.conditionStore) {
                if (macro.name === condition) {
                    return macro
                }
            }
            //return new ConditionNotFoundError(this.current.node.condition.pos_start, this.current.node.condition.pos_end);
            return new RuntimeError(new Position(0,0,0,""), new Position(0,0,0,""), "Konnte Bedingung nicht finden");
        }
    
        return truthness
    }
}