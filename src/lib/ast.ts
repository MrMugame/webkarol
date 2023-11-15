import { Span } from "./tokens";

// TODO: Maybe make node at toplevel


/// Declarations

abstract class Decl {
    constructor(readonly position: Span, public body: Stmt[]) {};
}

class FuncDecl extends Decl {
    constructor(
        position: Span,
        body: Stmt[],
        readonly name: string
    ) {
        super(position, body);
    }
}

class CondDecl extends Decl {
    constructor(
        position: Span,
        body: Stmt[],
        readonly name: string
    ) {
        super(position, body);
    }
}

class ProgDecl extends Decl { 
    constructor(
        position: Span,
        body: Stmt[]
    ) {
        super(position, body);
    }
}

export { Decl, FuncDecl, CondDecl, ProgDecl };


/// Statements

abstract class Stmt {
    constructor(readonly position: Span) {};
}

class CondLoopStmt extends Stmt {
    constructor(
        position: Span,
        readonly cond: CondStmt,
        readonly body: Stmt[]
    ) {
        super(position);
    }
}

class IterLoopStmt extends Stmt {
    constructor(
        position: Span,
        readonly iterations: number,
        readonly body: Stmt[]
    ) {
        super(position);
    }
}

class InftyLoopStmt extends Stmt {
    constructor(
        position: Span,
        readonly body: Stmt[]
    ) {
        super(position);
    }
}

class IfStmt extends Stmt {
    constructor(
        position: Span,
        readonly cond: CondStmt,
        readonly body: Stmt[],
        readonly else_: Stmt[] | null
    ) {
        super(position);
    }
}

class CallStmt extends Stmt {
    constructor(
        position: Span,
        readonly name: string,
        readonly parameter: string | number | null,
    ) {
        super(position);
    }
}

class CondStmt extends Stmt {
    constructor(
        position: Span,
        readonly name: string,
        readonly not: boolean,
        readonly parameter: string | number | null,
    ) {
        super(position);
    }
}

export { Stmt, CondLoopStmt, IterLoopStmt, InftyLoopStmt, IfStmt, CallStmt, CondStmt }


