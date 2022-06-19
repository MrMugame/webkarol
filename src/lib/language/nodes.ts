import { Nodes, Position } from "./types";

export class Node {
    private type: Nodes;
    posStart: Position;
    posEnd: Position;

    constructor(type: Nodes, posStart: Position, posEnd: Position) {
        this.type = type;
        this.posStart = posStart;
        this.posEnd = posEnd;
    }

    match(type: Nodes) {
        return type === this.type
    }
}

export class BodyNode extends Node {
    constructor(type: Nodes, posStart: Position, posEnd: Position, public body: Node[]) {
        super(type, posStart, posEnd);
    }
}

export class LoopNode extends BodyNode {
    constructor(
        public iterations: number,
        body: Node[],
        posStart: Position,
        posEnd: Position,
    ){
        super(Nodes.LoopNode, posStart, posEnd, body);
    }
}

export class CallNode extends Node {
    constructor(
        public name: string,
        posStart: Position,
        posEnd: Position
    ){
        super(Nodes.CallNode, posStart, posEnd);
    }
}

export class SpecialCallNode extends Node {
    constructor(
        public name: string,
        posStart: Position,
        posEnd: Position
    ){
        super(Nodes.SpecialCallNode, posStart, posEnd);
    }
}

export class CaseLoopNode extends BodyNode {
    constructor(
        public condition: ConditionNode,
        body: Node[],
        posStart: Position,
        posEnd: Position
    ){
        super(Nodes.CaseLoopNode, posStart, posEnd, body);
    }
}

export class ConditionNode extends Node {
    constructor(
        public condition: string,
        public inverted: boolean,
        posStart: Position,
        posEnd: Position
    ){
        super(Nodes.ConditionNode, posStart, posEnd);
    }
}

export class CaseNode extends BodyNode {
    constructor(
        public condition: ConditionNode,
        public notBody: Node[],
        body: Node[],
        posStart: Position,
        posEnd: Position
    ){
        super(Nodes.CaseNode, posStart, posEnd, body);
    }
}

export class MacroNode extends BodyNode {
    constructor(
        public name: string,
        body: Node[],
        posStart: Position,
        posEnd: Position
    ){
        super(Nodes.MacroNode, posStart, posEnd, body);
    }
}

export class ConditionMacroNode extends BodyNode {
    constructor(
        public name: string,
        body: Node[],
        posStart: Position,
        posEnd: Position
    ){
        super(Nodes.ConditionMacroNode, posStart, posEnd, body);
    }
}

export class ProgramNode extends BodyNode {
    constructor(
        body: Node[],
        posStart: Position,
        posEnd: Position
    ){
        super(Nodes.ProgramNode, posStart, posEnd, body);
    }
}