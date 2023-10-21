import { KEYWORDS, Span, Token, TokenType } from "./tokens";
// TODO: $lib alias in vite

const NUMBER = /[0-9]/;
const LETTER = /[[a-zA-ZäöüÄÖÜß*_]/;

export class Lexer {
	private input: string
	private index: number
	private start: Span.Position
	private position: Span.Position
	public currToken: Token

	constructor(input: string) {
		this.input = input;
		this.index = -1;
		this.position = { line: 1, column: -1 };
		this.start = this.position;
		this.currToken = new Token(TokenType.INVALID, new Span(this.start, this.start), null);
		this.nextChar()
	}

	private get currChar(): string {
		return this.input[this.index] ?? "\0";
	}

	private isAtEnd(): boolean {
		return this.index >= this.input.length;
	}

	private nextChar() {
		this.position.column += 1;
		this.index += 1;

		if (this.currChar === "\n") {
			this.position.line += 1;
			this.position.column = 0;
		}
	}

	private setToken(type: TokenType, value: string|null = null) {
		this.currToken = new Token(type, new Span({...this.start}, {...this.position}), value)
	}

	public nextToken() {
		while (!this.isAtEnd() && /[ \t\n;]/.test(this.currChar)) this.nextChar();

		if (this.isAtEnd()) {
			this.setToken(TokenType.EOF);
			return;
		}

		this.start = {...this.position};

		switch (this.currChar) {
		case "{": {
			let prevIndex = this.index;

			// Cast because Typescript is bullshit LOL
			while ((this.currChar as string) !== "}") {
				this.nextChar();

				if (this.isAtEnd()) {
					this.index = prevIndex;
					break;
				}
			}
			this.nextChar();

			this.nextToken();
		} break;
		// Seems like one line comments are deprecated in 3.0
		// case "/": {
		// 	this.nextChar();
		// 	if (this.currChar !== "/") console.assert(false, "Expected second '/'");

		// 	while (!this.isAtEnd() && (this.currChar as string) !== "\n") this.nextChar();
		// 	this.nextChar();

		// 	this.nextToken();
		// } break;
		case "(": {
			this.nextChar();
			this.setToken(TokenType.LPREN);
		} break;
		case ")": {
			this.nextChar();
			this.setToken(TokenType.RPREN);
		} break;
		// Same with strings 
		// case "\"": {
		// 	this.nextChar();

		// 	let str: string = "";
		// 	while (this.currChar !== "\"") {
		// 		str += this.currChar;
		// 		this.nextChar();

		// 		if (this.isAtEnd()) {
		// 			console.assert(false, "String not closed");
		// 			break;
		// 		}
		// 	}

		// 	this.nextChar();
		// 	this.setToken(TokenType.STR_LITERAL, str);
		// } break;
		default: {
			if (NUMBER.test(this.currChar)) {
				let num: string = "";
				while (!this.isAtEnd() && NUMBER.test(this.currChar)) {
					num += this.currChar;
					this.nextChar();
				}

				this.setToken(TokenType.INT_LITERAL, num);
			} else if (LETTER.test(this.currChar)) {
				let sym: string = "";
				while (!this.isAtEnd() && (NUMBER.test(this.currChar) || LETTER.test(this.currChar))) {
					sym += this.currChar;
					this.nextChar();
				}

				if (KEYWORDS.has(sym.toLowerCase())) {
					this.setToken(KEYWORDS.get(sym)!);
				} else {
					this.setToken(TokenType.IDENTIFIER, sym.toLowerCase())
				}
			} else {
				// Just yeet unknown tokens lol
				this.nextChar();
				this.nextToken();
			}
		}
		}
	}
}
