import { LanguageError } from "./error";
import { CallNode, CaseLoopNode, CaseNode, ConditionMacroNode, ConditionNode, LoopNode, MacroNode, Node, ProgramNode, SpecialCallNode } from "./nodes";
import { Position, Token, Tokens } from "./types";


export class Parser {
    private tokens: Token[];
    private index: number;
    private currentToken: Token;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.index = -1;
        this.currentToken = new Token(Tokens.Eof, null, new Position(0,0,0,""), new Position(0,0,0,""));
        this.advance();
    }

    private advance() {
        this.index += 1;
        this.currentToken = this.tokens[this.index];
    }

    public parse(): Node[] | LanguageError {
        let result = [];
        
        while (!this.currentToken.match(Tokens.Eof) && this.currentToken !== undefined) {
            let res: LanguageError | Node;

            if (this.currentToken.match(Tokens.Keyword, "wiederhole")) {
                this.advance();
                if (this.currentToken.match(Tokens.Keyword, "solange")) {
                    res = this.makeCaseLoopExpr();
                } else if (this.currentToken.match(Tokens.Integer)) {
                    res = this.makeLoopExpr();
                } else {
                    //return { parsed: [], err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) }
                    return this.createError("Unerwartetes Wort nach wiederhole")
                }
            } else if (this.currentToken.match(Tokens.Keyword, "wenn")) {
                res = this.makeCaseExpr();
            } else if (this.currentToken.match(Tokens.Keyword, "Anweisung")) {
                res = this.makeMacroExpr();
            } else if (this.currentToken.match(Tokens.Keyword, "Bedingung")) {
                res = this.makeConditionExpr();
            } else if (this.currentToken.match(Tokens.Keyword, "Programm")) {
                res = this.makeProgramExpr()
            } else if (this.currentToken.match(Tokens.Keyword, "wahr", "falsch")) {
                res = new SpecialCallNode(String(this.currentToken.value), this.currentToken.posStart.copy(), this.currentToken.posEnd.copy());
                this.advance();
            } else if (this.currentToken.match(Tokens.Identifier)) {
                res = this.makeCallExpr();
            } else if (this.currentToken.match(Tokens.Comment)){
                this.advance();
                continue;
            } else if (this.currentToken.match(Tokens.Eof)){
                break;
            } else {
                //return { parsed: [], err: new UnexpectedError(this.currentToken.pos_start, this.currentToken.pos_end) }
                return this.createError("Unerwarteter Fehler")
            }

            if (res instanceof LanguageError) { return res }
            result.push(res);
        }

        return result
    }

    private makeCallExpr(): CallNode | LoopNode | LanguageError {
        let posStart = this.currentToken.posStart.copy();
        let basic_node = new CallNode(String(this.currentToken.value), posStart, this.currentToken.posEnd.copy());

        this.advance();

        if (this.currentToken.match(Tokens.Lpren)) {
            this.advance();
            if (!this.currentToken.match(Tokens.Integer)) {
                //return { parsed: [], err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) }
                return this.createError("Unerwartetes Wort nach der Klammer")
            }

            let iterations = parseInt(String(this.currentToken.value));
            this.advance();
            if (!this.currentToken.match(Tokens.Rpren)) {
                //return { parsed: [], err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) }
                return this.createError("Klammer muss geschlossen werden")
            }

            this.advance();
            return new LoopNode(iterations, [basic_node], posStart, this.currentToken.posEnd.copy())
        } else {
            return basic_node
        }
    }

    private makeProgramExpr(): ProgramNode | LanguageError {
        let posStart = this.currentToken.posStart.copy();

        let [res, _] = this.makeExprBody(["Programm"], ["endeProgramm", "*Programm"]);
        if (res instanceof LanguageError) { return res }

        //this.advance();
        return new ProgramNode(res, posStart, this.currentToken.posEnd.copy());
    }

    private makeConditionExpr(): ConditionMacroNode | LanguageError {
        let posStart = this.currentToken.posStart.copy();

        this.advance();

        if (!this.currentToken.match(Tokens.Identifier)) {
            //return { parsed: null, err: new NoNameError(this.currentToken.pos_start, this.currentToken.pos_end) };
            return this.createError("Name für Bedingung muss angegeben werden")
        }

        let name = String(this.currentToken.value);

        let [res, _] = this.makeExprBody(["Bedingung"], ["endeBedingung", "*Bedingung"]);
        if (res instanceof LanguageError) { return res }

        this.advance();
        return new ConditionMacroNode(name, res, posStart, this.currentToken.posEnd.copy())
    }

    private makeMacroExpr(): MacroNode | LanguageError {
        let posStart = this.currentToken.posStart.copy();
        this.advance();

        if (!this.currentToken.match(Tokens.Identifier)) {
            //return { parsed: null, err: new NoNameError(this.currentToken.pos_start, this.currentToken.pos_end) };
            return this.createError("Name für Anweisung muss angegeben werden")
        }
        let name = String(this.currentToken.value);

        let [res, _] = this.makeExprBody(["Anweisung"], ["endeAnweisung", "*Anweisung"]);
        if (res instanceof LanguageError) { return res }

        return new MacroNode(name, res, posStart, this.currentToken.posEnd.copy())
    }

    private makeCaseExpr(): CaseNode | LanguageError {
        let inverted = false;
        let posStart = this.currentToken.posStart.copy();
        this.advance();
        
        if (this.currentToken.match(Tokens.Keyword, "nicht")) {
            inverted = true;
            this.advance();
        }
        
        if (!this.currentToken.match(Tokens.Identifier)) {
            //return { node: null, err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) };
            return this.createError("Auf wenn muss eine Bedingung folgen")
        }
        let condition = this.currentToken;
        
        this.advance();
        if (!this.currentToken.match(Tokens.Keyword, "dann")) {
            //return { node: null, err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) };
            return this.createError("Auf Bedingung muss das Wort 'dann' folgen")
        }

        let [res, endToken]= this.makeExprBody(["wenn"],["endewenn", "*wenn"], false, ["sonst"]);
        if (res instanceof LanguageError) { return res }

        let body = res;

        let notBody: Node[] = [];

        if (endToken !== undefined && endToken.match(Tokens.Keyword, "sonst")) {
            let [res, _]= this.makeExprBody(["wenn"], ["endewenn", "*wenn"], true);
            if (res instanceof LanguageError) { return res }


            notBody = res;
        }

        return new CaseNode(new ConditionNode(String(condition.value), inverted, condition.posStart, condition.posEnd), notBody, body, posStart, this.currentToken.posEnd.copy())
    }

    private makeCaseLoopExpr(): CaseLoopNode | LanguageError {
        let inverted = false;
        let posStart = this.currentToken.posStart.copy();

        this.advance();

        if (this.currentToken.match(Tokens.Keyword, "nicht")) {
            inverted = true;
            this.advance();
        }
        
        if (!this.currentToken.match(Tokens.Identifier)) {
            //return { node: null, err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) };
            return this.createError("Auf 'solange' muss eine Bedingung folgen")
        }

        let condition = this.currentToken;

        let [res, _] = this.makeExprBody(["wiederhole"], ["endewiederhole", "*wiederhole"]);
        if (res instanceof LanguageError) { return res }

        return new CaseLoopNode(new ConditionNode(String(condition.value), inverted, condition.posStart.copy(), condition.posEnd.copy()) , res, posStart, this.currentToken.posEnd.copy())
    }

    private makeLoopExpr(): LoopNode | LanguageError {
        let iteration_count = parseInt(String(this.currentToken.value));
        let posStart = this.currentToken.posStart.copy();

        this.advance();
        if (!this.currentToken.match(Tokens.Keyword, "mal")) {
            //return { node: null, err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) };
            return this.createError("Auf die Wiederholungsanzahl muss 'mal' folgen")
        }

        let [res, _] = this.makeExprBody(["wiederhole"], ["endewiederhole", "*wiederhole"]);
        if (res instanceof LanguageError) { return res }

        return new LoopNode(iteration_count, res, posStart, this.currentToken.posEnd.copy())
    }

    private makeExprBody(openWord: string[], closeWord: string[], dontSkip: Boolean = false, specialWord?: string[]): [Node[] | LanguageError, Token | undefined] {
        let body: Token[] = [];
        let nesting = 1;

        if (!dontSkip) {
            this.advance();
        }
        
        while (nesting > 0) {
            if (this.currentToken.match(Tokens.Keyword, ...openWord)) {
                nesting += 1;
            } else if (this.currentToken.match(Tokens.Keyword, ...closeWord)) {
                nesting -= 1;
            } else if (specialWord != undefined && this.currentToken.match(Tokens.Keyword, ...specialWord) && nesting <= 1) {
                nesting -= 1;
            }
            

            if (this.currentToken.match(Tokens.Eof)) {
                return [this.createError("Ende des Dokumentes wurde erreicht"), undefined]
            }
            body.push(this.currentToken);
            
            this.advance();
        }

        let endWord = body.pop();

        body.push(new Token(Tokens.Eof, null, this.currentToken.posStart.copy(),  this.currentToken.posEnd.copy()));

        let parser = new Parser(body);
        return [parser.parse(), endWord];
    }

    private createError(text: string): LanguageError {
        return new LanguageError(this.currentToken.posEnd.copy(), this.currentToken.posEnd.copy(), text);
    }
}