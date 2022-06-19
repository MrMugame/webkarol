import { isRuntimeError, RuntimeError } from "./error";
import { BodyNode, CallNode, CaseLoopNode, CaseNode, ConditionMacroNode, LoopNode, MacroNode, Node, ProgramNode, SpecialCallNode } from "./nodes";
import { Nodes, Position, State } from "./types";
import { World } from "../graphics/World.js"


class Location {
    constructor(
        public node: Node,
        public position: number,
        public valid: Boolean,
        public iterations: number,
        public truthness: Boolean
    ) {}

    getCurrent(notBody?: Boolean): Location {
        if (this.node instanceof BodyNode) {
            let current: Node;
            if (notBody && this.node instanceof CaseNode) {
                current = this.node.notBody[this.position];
            } else {
                current = this.node.body[this.position];
            }

            if (current === undefined) {
                if (this.iterations > 1) {
                    this.iterations -= 1;
                    this.position = 0;
                    current = this.node.body[this.position];
                } else {
                    return new NullLocation()
                }
            }

            return new Location(current, 0, false, 0, true);
        } else {
            return new NullLocation()
        }
    }
}

class NullLocation extends Location {
    constructor() {
        let pos = new Position(0,0,0,"");
        super(new Node(Nodes.CallNode, pos, pos), -1, false, 0, true);
    }
}


export class Interpreter {
    private macroStore: MacroNode[];
    private conditionStore: ConditionMacroNode[];
    private stack: Location[];
    private current: Location;
    private world: World;


    constructor(world: World, nodes: Node[]) {
        this.macroStore = [];
        this.conditionStore = [];
        this.current = new NullLocation();
        this.world = world;

        this.stack = [];

        for (let node of nodes) {
            if (node instanceof MacroNode) {
                this.macroStore.push(node);
            } else if (node instanceof ConditionMacroNode) {
                this.conditionStore.push(node);
            } else if (node instanceof ProgramNode) {
                this.current = new Location(node, 0, false, 0, true);
            } 
        }

        if (this.current instanceof NullLocation) {
            let buffer: Node[] = [];

            for (let node of nodes) {
                if (!(node instanceof MacroNode) && !(node instanceof ConditionMacroNode)) {
                    buffer.push(node);
                }
            }

            if (buffer.length > 0) {
                this.current = new Location(new ProgramNode(buffer, buffer[0].posStart.copy(),(buffer.at(-1)?.posEnd?.copy()) || buffer[0].posStart.copy()), 0, false, 0, true)
            } else {
                // error
            }
        }
    }

    public interpret(): State | RuntimeError  {
        //console.log(this.current?.node?.type, this.current?.valid )
        //console.log(this.stack)

        if (this.current instanceof NullLocation) {
            let popped = this.stack.pop();

            if (popped === undefined) return State.Finished

            popped.position += 1;

            if (!(popped.getCurrent() instanceof NullLocation)) {
                this.current = popped;
            } else if (popped.node instanceof ConditionMacroNode) {
                let truthness = popped.truthness;

                popped = this.stack.pop();

                if (popped === undefined) return { err: "test" }

                popped.valid = true;
                if (popped.node instanceof CaseNode) {
                    if (popped.node.notBody.length == 0 && !truthness) {
                        popped = new NullLocation();
                    } else {
                        popped.truthness = truthness;
                    }
                } else if (popped.node instanceof CaseLoopNode) {
                    if (!truthness) {
                        popped = new NullLocation();
                    }
                }

                this.current = popped;
            } else if (popped.valid === true && popped.iterations === 0) {
                if (popped.node instanceof CaseNode || popped.node instanceof MacroNode || popped.node instanceof ConditionMacroNode) {
                    this.current = new NullLocation();
                } else {
                    this.current = popped;
                    this.current.position = 0;
                    this.current.valid = false;
                }
            } else {
                this.current = new NullLocation();
            }
        } else if (this.current.node instanceof ProgramNode || ((this.current.node instanceof MacroNode || this.current.node instanceof ConditionMacroNode) && this.current.valid))  {
            this.stack.push(this.current);

            this.current = this.current.getCurrent();
        } else if (this.current.node instanceof CallNode) {
            this.stack.push(this.current);

            let res = this.executeCall(this.current.node.name);
            if (isRuntimeError(res) || res === State.Killed || res === State.Finished || res === State.Running) return res

            if (res !== null) {
                this.current = new Location(res, 0, true, 0, true);
            } else {
                this.current = new NullLocation();
            }
        } else if (this.current.node instanceof SpecialCallNode) {
            this.stack.push(this.current);
            
            for (let positions of this.stack) {
                if (positions.node instanceof ConditionMacroNode) {
                    positions.truthness = this.current.node.name === "wahr" ? true : false;
                    this.current = new NullLocation();
                    return State.Running
                }
            }

            //return new SpecialNodePlacmentError(this.current.node.pos_start.copy(), this.current.node.pos_end.copy());
        } else if (this.current.node instanceof LoopNode) {
            this.stack.push(this.current);
            
            if (this.current.valid) {
                this.current = this.current.getCurrent();
            } else {
                this.current.iterations = this.current.node.iterations;
                this.current.valid = true;
            }
        } else if (this.current.node instanceof CaseNode) {
            if (this.current.valid) {
                this.stack.push(this.current);
                this.current = this.current.getCurrent(!this.current.truthness);
            } else {
                let res = this.checkCondition(this.current.node.condition.condition);
                if (isRuntimeError(res)) return res

                if (res instanceof ConditionMacroNode) {
                    this.stack.push(this.current);
                    this.current = new Location(res, 0, true, 0, false);
                    return State.Running
                }
                
                if (res) {
                    this.current.valid = true;
                    this.current.truthness = res;
                } else if (this.current.node.notBody.length > 0) {
                    this.current.valid = true;
                    this.current.truthness = res;
                } else {
                    this.current = new NullLocation();
                }
                
            }
        } else if (this.current.node instanceof CaseLoopNode) {
            if (this.current.valid) {
                this.stack.push(this.current);
                this.current = this.current.getCurrent();
            } else {
                let res = this.checkCondition(this.current.node.condition.condition);
                if (isRuntimeError(res)) return res

                
                if (res instanceof ConditionMacroNode) {
                    this.stack.push(this.current);
                    this.current = new Location(res, 0, true, 0,false);
                    return State.Running
                }

                if (this.current.node.condition.inverted ? !res : res) {
                    this.current.valid = true;
                } else {
                    this.current = new NullLocation();
                }
            }
            
        } else if (this.current.node instanceof MacroNode || this.current.node instanceof ConditionMacroNode) {
            //return new IllegalMacroError(this.current.node.pos_start.copy(), this.current.node.pos_end.copy())
        }

        return State.Running
    }


    private executeCall(name: string): MacroNode | RuntimeError | null | State {
        let err: null | RuntimeError | State | void = null;

        if (name === "Schritt") {
            err = this.world.step();
        } else if (name === "RechtsDrehen") {
            err = this.world.rotate_right();
        } else if (name === "LinksDrehen") {
            err = this.world.rotate_left();
        } else if (name === "Hinlegen") {
            err = this.world.drop();
        } else if (name === "MarkeSetzen") {
            err = this.world.set_mark();
        } else if (name === "MarkeLöschen") {
            err = this.world.delete_mark();
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
            err = { err: "test" }
        }

        err = null

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
            return { err: "test" }
        }

        return truthness
    }

}