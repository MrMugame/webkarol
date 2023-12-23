import { KEYWORDS, Span, Token, TokenType as TK } from "./tokens";
import { copy } from "./util";
// TODO: $lib alias in vite

const NUMBER = /[0-9]/;
const LETTER = /[[a-zA-ZäöüÄÖÜß*_]/;

export class Lexer {
	private input: string
	private start: Span.Position
	private position: Span.Position
	public currToken: Token

	// TODO: Fix double index
	constructor(input: string) {
		this.input = input;
		this.position = { line: 1, column: -1, idx: -1 };
		this.start = this.position;
		this.currToken = new Token(TK.INVALID, new Span(this.start, this.start), null);
		this.nextChar();
	}

	private get currChar(): string {
		return this.input[this.position.idx] ?? "\0";
	}

	private isAtEnd(): boolean {
		return this.position.idx >= this.input.length;
	}

	private nextChar(): void {
		this.position.idx += 1;
		this.position.column += 1;

		if (this.currChar === "\n") {
			this.position.line += 1;
			this.position.column = 0;
		}
	}

	private setToken(type: TK, value: string | null = null): void {
		this.currToken = new Token(type, new Span(copy(this.start), copy(this.position)), value)
	}

	// Lexer never erros. Not my decision
	public nextToken(): void {
		// Not really needed, because on unknown chars we skip to the next anyways
		while (!this.isAtEnd() && /[ \t\n;]/.test(this.currChar)) this.nextChar();

		if (this.isAtEnd()) {
			this.setToken(TK.EOF);
			return;
		}

		this.start = copy(this.position);

		switch (this.currChar) {
			case "{": {
				let prevIndex = this.position.idx;

				// TODO: Make this an actually Token for syntax highlighting

				// Cast because Typescript is bullshit LOL
				while ((this.currChar as string) !== "}") {
					this.nextChar();

					if (this.isAtEnd()) {
						// Normal karol also doesn't error on multiline comments which aren't closed.
						this.position.idx = prevIndex;
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
				this.setToken(TK.LPREN);
			} break;
			case ")": {
				this.nextChar();
				this.setToken(TK.RPREN);
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

					this.setToken(TK.INT_LITERAL, num);
				} else if (LETTER.test(this.currChar)) {
					let sym: string = "";
					while (!this.isAtEnd() && (NUMBER.test(this.currChar) || LETTER.test(this.currChar))) {
						sym += this.currChar;
						this.nextChar();
					}

					sym = sym.toLowerCase();
					if (KEYWORDS.has(sym)) {
						this.setToken(KEYWORDS.get(sym)!);
					} else {
						this.setToken(TK.IDENTIFIER, sym)
					}
				} else {
					// Just yeet unknown tokens
					this.nextChar();
					this.nextToken();
				}
			}
		}
	}
}
