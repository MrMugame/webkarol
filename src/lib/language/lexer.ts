import { LanguageError } from "./error";
import { Keywords, Position, Token, Tokens } from "./types";

const LETTERS = new RegExp('[a-zA-ZäöüÄÖÜß*_]');
const NUMBERS = new RegExp('[0-9]');

export class Lexer {
    private text: string;
    private pos: Position;
    private currentChar: string | null;

    constructor(text: string) {
        this.text = text;
        this.pos = new Position(-1,0,-1,this.text);
        this.currentChar = null;
        this.advance();
    }

    private advance() {
        this.pos.advance(this.currentChar);
        this.currentChar = this.text[this.pos.index];
    }

    public tokenize(): Token[] | LanguageError {
        let tokens: Token[] = [];

        while (this.currentChar != null) {
            if (["\n", ";", " ", "\t"].includes(this.currentChar)) {
                this.advance();
            } else if (this.currentChar === '{') {
                let res = this.makeComment();
                if (res instanceof LanguageError) {
                    return res
                }
                tokens.push(res);
            } else if (LETTERS.test(this.currentChar)) {
                tokens.push(this.makeIdentifier());
            } else if (NUMBERS.test(this.currentChar)) {
                tokens.push(this.makeNumber());
            } else if (this.currentChar === '"') {
                let res = this.makeString();
                if (res instanceof LanguageError)  {
                    return res
                }
                tokens.push(res);
            } else if (this.currentChar === '(') {
                tokens.push(new Token(Tokens.Rpren, null, this.pos.copy(), this.pos.copy()));
                this.advance();
            } else if (this.currentChar === ')') {
                tokens.push(new Token(Tokens.Lpren, null, this.pos.copy(), this.pos.copy()));
                this.advance();
            } else {
                //return {lexed: null, err: new IllegalCharError(this.pos)}
                return new LanguageError(this.pos.copy(), this.pos.copy(), "Konnte Charakter nicht identifizieren");
            }

        }

        tokens.push(new Token(Tokens.Eof, null, this.pos.copy(), this.pos.copy()));

        return tokens;
    }

    private makeComment(): Token | LanguageError {
        const pos_start = this.pos.copy();
        let nesting = 1;
        this.advance();
        
        while (nesting > 0) {
            if (this.currentChar === null) {
                //return new UnterminatedCommentError(this.pos.copy())
                return new LanguageError(pos_start.copy(), this.pos.copy(), "Der Kommentar wurde nicht beendet");
            }

            if (this.currentChar === '{') {
                nesting += 1;
            } else if (this.currentChar === '}') {
                nesting -= 1;
            }

            this.advance();
        }

        return new Token(Tokens.Comment, null, pos_start, this.pos.copy());
    }

    private makeIdentifier(): Token {
        let pos_start = this.pos.copy();
        let str = "";

        while (this.currentChar != null && (LETTERS.test(this.currentChar) || NUMBERS.test(this.currentChar))) {
            str += this.currentChar;
            this.advance();
        }

        let token_type = Keywords.includes(str) ? Tokens.Keyword : Tokens.Identifier;

        return new Token(token_type, str, pos_start, this.pos.copy());
    }

    private makeNumber(): Token {
        let pos_start = this.pos.copy();
        let str = "";

        while (this.currentChar != null && NUMBERS.test(this.currentChar)) {
            str += this.currentChar;
            this.advance();
        }

        return new Token(Tokens.Integer, parseInt(str), pos_start, this.pos.copy());
    }

    private makeString(): Token | LanguageError {
        let pos_start = this.pos.copy();
        let str = "";
        this.advance();

        while (this.currentChar != '"') {
            if (this.currentChar === null) {
                //return new UnterminatedStringError(this.pos.copy());
                return new LanguageError(pos_start.copy(), this.pos.copy(), "Die Zeichenkette wurde nicht beendet");
            }
            str += this.currentChar;
            this.advance();
        }

        this.advance();

        return new Token(Tokens.String, str, pos_start, this.pos.copy());
    }
}