import { isLanguageError, LanguageError } from "./error";
import { CaseLoopNode, CaseNode, ConditionNode, LoopNode, MacroNode } from "./nodes";
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
        
        while (!this.currentToken.match(Tokens.Eof, null) || this.currentToken === undefined) {
            if (this.currentToken.match(Tokens.Keyword, "wiederhole")) {
                this.advance();
                if (this.currentToken.match(Tokens.Keyword, "solange")) {
                    let res = this.makeCaseLoopExpr();
                    if (isLanguageError(res)) { return res }
                    result.push(res);
                } else if (this.currentToken.match(Tokens.Integer, null)) {
                    let res = this.makeLoopExpr();
                    if (isLanguageError(res)) { return res }
                    result.push(res);
                } else {
                    //return { parsed: [], err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) }
                    return { text: "test" }
                }
            } else if (this.currentToken.match(Tokens.Keyword, "wenn")) {
                let res = this.makeCaseExpr();
                if (isLanguageError(res)) { return res }
                result.push(res);
            } else if (this.currentToken.match(Tokens.Keyword, "Anweisung")) {
                let res = this.makeMacroExpr();
                if (isLanguageError(res)) { return res }
                result.push(res);
            } else if (this.currentToken.match(Tokens.Keyword, "Bedingung")) {
                let pos_start = this.currentToken.pos_start.copy();
                this.advance();
                if (!this.currentToken.match(Tokens.Identifier)) {
                    return { parsed: null, err: new NoNameError(this.currentToken.pos_start, this.currentToken.pos_end) };
                }
                let name = this.currentToken.value;

                let {parsed, err} = this.make_condition_body();
                if (err != null) {
                    return { parsed: null, err: err }
                }

                result.push(new ConditionMacroNode(name, parsed, pos_start, this.currentToken.pos_end.copy()));
                this.advance();
            } else if (this.currentToken.match(Tokens.Keyword, "Programm")) {
                let {parsed, err} = this.make_prog_body();
                if (err != null) {
                    return { parsed: null, err: err }
                }
                result.push(new ProgramNode(parsed));
                this.advance();
            } else if (this.currentToken.match(Tokens.Keyword, "wahr", "falsch")) {
                result.push(new SpecialCallNode(this.currentToken.value, this.currentToken.pos_start, this.currentToken.pos_end));
                this.advance();
            } else if (this.currentToken.match(Tokens.Identifier)) {
                let basic_node = new CallNode(this.currentToken.value, this.currentToken.pos_start, this.currentToken.pos_end);

                this.advance();
                if (this.currentToken.match(Tokens.LPREN)) {
                    this.advance();
                    if (!this.currentToken.match(Tokens.Integer)) {
                        return { parsed: [], err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) }
                    }

                    let iterations = this.currentToken.value;
                    this.advance();
                    if (!this.currentToken.match(Tokens.RPREN)) {
                        return { parsed: [], err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) }
                    }

                    result.push(new LoopNode(iterations, [basic_node]));
                    this.advance();
                } else {
                    result.push(basic_node);
                }
            } else if (this.currentToken.match(Tokens.COMMENT)){
                this.advance();
                continue;
            } else if (this.currentToken.match(Tokens.EOF)){
                break;
            } else {
                return { parsed: [], err: new UnexpectedError(this.currentToken.pos_start, this.currentToken.pos_end) }
            }
        }

        return result
    }

    private makeMacroExpr(): MacroNode | LanguageError {
        let posStart = this.currentToken.posStart.copy();
        this.advance();

        if (!this.currentToken.match(Tokens.Identifier, null)) {
            //return { parsed: null, err: new NoNameError(this.currentToken.pos_start, this.currentToken.pos_end) };
            return { text: "test" }
        }
        let name = this.currentToken.value;

        let [res, _] = this.makeExprBody(["Anweisung"], ["endeAnweisung", "*Anweisung"]);
        if (isLanguageError(res)) { return res }

        return new MacroNode(name, res, posStart, this.currentToken.posEnd.copy())
    }

    private makeCaseExpr(): CaseNode | LanguageError {
        let inverted = false;
        this.advance();
        
        if (this.currentToken.match(Tokens.Keyword, "nicht")) {
            inverted = true;
            this.advance();
        }
        
        if (!this.currentToken.match(Tokens.Identifier, null)) {
            //return { node: null, err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) };
            return { text: "test" }
        }
        let condition = this.currentToken;
        
        this.advance();
        if (!this.currentToken.match(Tokens.Keyword, "dann")) {
            //return { node: null, err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) };
            return { text: "test" }
        }

        this.advance();
        let [res, endToken]= this.makeExprBody(["wenn"],["endewenn", "*wenn", "sonst"]);
        if (isLanguageError(res)) { return res }

        let body = res;

        let notBody: Node[] = [];

        if (endToken !== undefined && endToken.match(Tokens.Keyword, "sonst")) {
            let [res, _]= this.makeExprBody(["wenn"],["endewenn", "*wenn", "sonst"]);
            if (isLanguageError(res)) { return res }

            notBody = res;
        }

        return new CaseNode(new ConditionNode(condition.value, inverted, condition.posStart, condition.posEnd), body, notBody)
    }

    private makeCaseLoopExpr(): LoopNode | LanguageError {
        let inverted = false;

        this.advance();

        if (this.currentToken.match(Tokens.Keyword, "nicht")) {
            inverted = true;
            this.advance();
        }
        
        if (!this.currentToken.match(Tokens.Identifier, null)) {
            //return { node: null, err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) };
            return { text: "test" }
        }

        let condition = this.currentToken;

        let [res, _] = this.makeExprBody(["wiederhole"], ["endewiederhole", "*wiederhole"]);
        if (isLanguageError(res)) { return res }

        return new CaseLoopNode(new ConditionNode(condition.value, inverted, condition.posStart.copy(), condition.posEnd.copy()) , res)
    }

    private makeLoopExpr(): LoopNode | LanguageError {
        let iteration_count = this.currentToken.value;

        this.advance();
        if (!this.currentToken.match(Tokens.Keyword, "mal")) {
            //return { node: null, err: new UnexpectedTokenError(this.currentToken.pos_start, this.currentToken.pos_end) };
            return { text: "test" }
        }

        let [res, _] = this.makeExprBody(["wiederhole"], ["endewiederhole", "*wiederhole"]);
        if (isLanguageError(res)) { return res }

        return new LoopNode(iteration_count, res)
    }

    private makeExprBody(openWord: string[], closeWord: string[]): [Node[] | LanguageError, Token | undefined] {
        let body = [];
        let nesting = 1;

        this.advance();
        
        while (nesting > 0) {
            if (this.currentToken.match(Tokens.Keyword, openWord)) {
                nesting += 1;
            } else if (this.currentToken.match(Tokens.Keyword, closeWord)) {
                nesting -= 1;
            }

            if (this.currentToken.match(Tokens.Eof, null)) {
                return [{ text: "test" }, undefined]
            }
            
            body.push(this.currentToken);
            
            this.advance();
        }

        let endWord = body.pop();

        //body.push(new Token(Tokens.Eof, null, this.currentToken.posStart.copy(),  this.currentToken.posEnd.copy()));

        let parser = new Parser(body);
        return [parser.parse(), endWord];
    }
}