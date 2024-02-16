export class Token {
    type: Tokens;
    value: string | number | null;
    posStart: Position;
    posEnd: Position;

    constructor(type: Tokens, value: string | number | null, posStart: Position, posEnd: Position) {
        this.type = type;
        this.value = value;
        this.posStart = posStart;
        this.posEnd = posEnd;
    }

    match(type: Tokens, ...values: string[]): boolean {
        if (this.type === type) {
            for (let i of values) {
                if (this.value === i) return true
            }
            return values.length > 0 ? false : true
        } else {
            return false
        }
    }
}

export class Position {
    index: number;
    line: number;
    column: number;
    text: string;

    constructor(index: number, line: number, column: number, text: string) {
        this.index = index;
        this.line = line;
        this.column = column;
        this.text = text;
    }

    advance(currentChar: string | null) {
        this.index += 1;
        this.column += 1;

        if (currentChar === '\n') {
            this.line += 1;
            this.column = 0;
        }
    }
    
    copy() {
        return new Position(this.index, this.line, this.column, this.text);
    }
}


export enum Nodes {
    LoopNode,
    CallNode,
    SpecialCallNode,
    CaseLoopNode,
    ConditionNode,
    ConditionMacroNode,
    CaseNode,
    MacroNode,
    ProgramNode,
}

export enum Tokens {
    Identifier,
    Keyword,
    Integer,
    String,
    Lpren,
    Rpren,
    Eof,
    Comment
}

export enum State {
    Finished,
    Killed,
    Running
}

export const Keywords = [
    "wiederhole",
    "mal",
    "solange",
    "endewiederhole",
    "*wiederhole",
    "wenn",
    "dann",
    "sonst",
    "nicht",
    "endewenn",
    "*wenn",
    "Anweisung",
    "endeAnweisung",
    "*Anweisung",
    "Bedingung",
    "endeBedingung",
    "*Bedingung",
    "Programm",
    "endeProgramm",
    "*Programm",
    "wahr",
    "falsch"
]