import { Nodes, Position } from "./types";

class Node {
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

export class LoopNode extends Node {
    constructor(iterations, body) {
        super(NODES.LOOP_NODE);
        this.iterations = iterations;
        this.body = body;
    }
}

export class CallNode extends Node {
    constructor(func, pos_start, pos_end) {
        super(NODES.CALL_NODE, pos_start, pos_end);
        this.func = func;
    }
}

export class SpecialCallNode extends Node {
    constructor(func, pos_start, pos_end) {
        super(NODES.SPECIAL_CALL_NODE, pos_start, pos_end);
        this.func = func;
    }
}

export class CaseLoopNode extends Node {
    constructor(condition, body) {
        super(NODES.CASE_LOOP_NODE);
        this.condition = condition;
        this.body = body;
    }
}

export class ConditionNode extends Node {
    constructor(condition, inverted, pos_start, pos_end) {
        super(NODES.CONDITION_NODE, pos_start, pos_end);
        this.condition = condition;
        this.inverted = inverted;
    }
}

export class CaseNode extends Node {
    constructor(condition, body, not_body) {
        super(NODES.CASE_NODE);
        this.condition = condition;
        this.body = body;
        this.not_body = not_body;
    }
}

export class MacroNode extends Node {
    constructor(name, body, pos_start, pos_end) {
        super(NODES.MACRO_NODE, pos_start, pos_end);
        this.name = name;
        this.body = body;
    }
}

export class ConditionMacroNode extends Node {
    constructor(name, body, pos_start, pos_end) {
        super(NODES.CONDITION_MACRO_NODE, pos_start, pos_end);
        this.name = name;
        this.body = body;
    }
}

export class ProgramNode extends Node {
    constructor(body) {
        super(NODES.PROGRAM_NODE);
        this.body = body;
    }
}