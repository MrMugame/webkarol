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

    match(type: Tokens, value: string | null | string[]): boolean {
        if (Array.isArray(value)) {
            let truthness = false;
            for (let i of value) {
                truthness = this.value === i
            }
            return truthness
        } else {
            return this.type === type && (value === null ? true : this.value === value)
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