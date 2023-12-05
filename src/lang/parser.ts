import { Lexer } from "./lexer";
import { Span, TokenType as TK } from "./tokens";
import { Result, assert, copy, is } from "./util";
import { CallStmt, CondDecl, CondLoopStmt, CondStmt, Decl, FuncDecl, IfStmt, InftyLoopStmt, IterLoopStmt, ProgDecl, Stmt } from "./ast"

const Err = Result.Err, Ok = Result.Ok;

export class Parser extends Lexer {
	constructor(input: string) {
		super(input);
	}

	private at(...tokens: TK[]): boolean {
		assert(tokens.length != 0, "at() was called without an argument");
		for (let token of tokens) {
			if (token === this.currToken.type) return true;
		}

		return false;
	}

	private consume(...tokens: TK[]): boolean {
		if (this.at(...tokens)) {
			this.nextToken();
			return true;
		}

		return false;
	}

	private location = () => copy(this.currToken.position);

	// TODO: Object syntax i.e. Karol.Schritt()
	// TODO: Libraries

	// <file> ::= {<decl>} {<stmt> | <progDecl>}
	public parse(): Result<Decl[], Error> {
		let result: Decl[] = [];

		this.nextToken();

		// 1. So the document beginns with a sequence of either function or condition
		// delerations. There can't be any statements in between this sequence.
		// 2. After the decls there can then be statements. If there is no program
		// declaration, those statements are the program. If there is a program declaration
		// it will be used.
		// 3. If a free floating statement sequence is used, there can't be any method declarations
		// after it. If not, you can declare functions after the programm declaration but they won't
		// be parsed
		// ==> If the program decleration is found the parsing will end

		while (this.at(TK.BEDINGUNG, TK.ANWEISUNG, TK.PROGRAMM)) {
			let decl = this.parseDecl();
			if (!decl.isOk()) return Err(decl.unwrapErr());

			result.push(decl.unwrap());

			if (is(ProgDecl, decl.unwrap())) return Ok(result);
		}

		let body: Stmt[] = [];
		let loc = this.location();

		while (!this.at(TK.EOF)) {
			if (this.at(TK.PROGRAMM)) {
				let decl = this.parseProgDecl();
				if (!decl.isOk()) return Err(decl.unwrapErr());
				result.push(decl.unwrap());
				return Ok(result);
			} else if (this.at(TK.BEDINGUNG, TK.ANWEISUNG)) return Err(new Error(";; WIP ;; Condition or Function Decleration after Stmts"));

			let stmt = this.parseStmt();
			if(!stmt.isOk()) return Err(stmt.unwrapErr());

			body.push(stmt.unwrap());
		}

		result.push(new ProgDecl(Span.concat(loc, this.location()), body));
		return Ok(result);
	}

	// <decl> :: <funcDecl> | <condDecl> | <progDecl>
	private parseDecl(): Result<Decl> {
		if (this.at(TK.BEDINGUNG)) return this.parseCondDecl();
		else if (this.at(TK.ANWEISUNG)) return this.parseFuncDecl();
		else if (this.at(TK.PROGRAMM)) return this.parseProgDecl();

		return Err(new Error(";; WIP ;; Couldn't parse declaration"));
	}

	// <condDecl> ::= bedingung <identifier> <body> (endebedingung | *bedingung)
	private parseCondDecl(): Result<CondDecl> {
		let loc = this.location();

		assert(this.consume(TK.BEDINGUNG), "parseCondDecl() was called without `bedingung`");

		let name = this.currToken.value;
		if (!this.consume(TK.IDENTIFIER)) return Err(new Error(";; WIP ;; Bedingung not followed by identifier"));

		let body = this.parseBody(TK.ENDE_BEDINGUNG);
		if (!body.isOk()) return Err(body.unwrapErr());
		this.nextToken();

		return Ok(new CondDecl(Span.concat(loc, this.location()), body.unwrap(), name!));
	}

	// <funcDecl> ::= anweisung <identifier> <body> (endeanweisung | *anweisung)
	private parseFuncDecl(): Result<FuncDecl> {
		let loc = this.location();

		assert(this.consume(TK.ANWEISUNG), "parseFuncDecl() was called without `anweisung`");

		let name = this.currToken.value;
		if (!this.consume(TK.IDENTIFIER)) return Err(new Error(";; WIP ;; Anweisung not followed by identifier"));

		let body = this.parseBody(TK.ENDE_ANWEISUNG);
		if (!body.isOk()) return Err(body.unwrapErr());
		this.nextToken();

		return Ok(new FuncDecl(Span.concat(loc, this.location()), body.unwrap(), name!));
	}

	// <progDecl> ::= programm <body> (endeprogramm | *programm)
	private parseProgDecl(): Result<ProgDecl> {
		let loc = this.location();

		assert(this.consume(TK.PROGRAMM), "parseProgDecl() was called without `programm`");

		let body = this.parseBody(TK.ENDE_PROGRAMM);
		if (!body.isOk()) return Err(body.unwrapErr());
		this.nextToken();

		return Ok(new ProgDecl(Span.concat(loc, this.location()), body.unwrap()));
	}

	// <stmt> ::=  <condLoopStmt> | <iterLoopStmt> | <inftyLoopStmt> | <ifStmt> | <callStmt>
	private parseStmt(): Result<Stmt> {
		if (this.at(TK.WIEDERHOLE)) return this.parseLoop();
		else if (this.at(TK.WENN)) return this.parseIf();
		else return this.parseCall();
	}

	private parseLoop(): Result<CondLoopStmt | InftyLoopStmt | IterLoopStmt> {
		let loc = this.location()

		assert(this.consume(TK.WIEDERHOLE), "parseLoop() was called without `wiederhole`");

		if (this.at(TK.SOLANGE)) return this.parseCondLoop(loc);
		else if (this.at(TK.IMMER)) return this.parseInftyLoop(loc);
		else if (this.at(TK.INT_LITERAL)) return this.parseIterLoop(loc);

		return Err(new Error(";; TODO ;; Unknown Token after wiederhole"));
	}

	// <condLoopStmt> ::= wiederhole solange <cond> <body> (endewiederhole | *wiederhole)
	private parseCondLoop(loc: Span): Result<CondLoopStmt> {
		assert(this.consume(TK.SOLANGE), "parseCondLoop() was called without `solange`");

		let cond = this.parseCond();
		if (!cond.isOk()) return Err(cond.unwrapErr());

		let body = this.parseBody(TK.ENDE_WIEDERHOLE);
		if (!body.isOk()) return Err(body.unwrapErr());
		this.nextToken();

		return Ok(new CondLoopStmt(Span.concat(loc, this.location()), cond.unwrap(), body.unwrap()));
	}

	// <inftyLoopStmt> ::= wiederhole immer <body> (endewiederhole | *wiederhole)
	private parseInftyLoop(loc: Span): Result<InftyLoopStmt> {
		assert(this.consume(TK.IMMER), "parseInftyLoop() was called without `immer`");

		let body = this.parseBody(TK.ENDE_WIEDERHOLE);
		if (!body.isOk()) return Err(body.unwrapErr());
		this.nextToken();

		return Ok(new InftyLoopStmt(Span.concat(loc, this.location()), body.unwrap()));
	}

	// <iterLoopStmt> ::= wiederhole <number> mal <body> (endewiederhole | *wiederhole)
	private parseIterLoop(loc: Span): Result<IterLoopStmt> {
		assert(this.at(TK.INT_LITERAL), "parseIterLoop() was called without int literal");

		let number = parseInt(this.currToken.value!);
		this.nextToken();

		if (!this.consume(TK.MAL)) return Err(new Error(";; WIP ;; Expected mal after wiederhole"));

		let body = this.parseBody(TK.ENDE_WIEDERHOLE);
		if (!body.isOk()) return Err(body.unwrapErr());
		this.nextToken();

		return Ok(new IterLoopStmt(Span.concat(loc, this.location()), number, body.unwrap()));
	}

	// <ifStmt> ::= wenn <cond> dann <body> [sonst <body>] endewenn
	private parseIf(): Result<IfStmt> {
		let loc = this.location();

		assert(this.consume(TK.WENN), "parseIf() was called without `wenn`");

		let cond = this.parseCond();
		if (!cond.isOk()) return Err(cond.unwrapErr());

		if (!this.consume(TK.DANN)) return Err(new Error(";; WIP ;; expected dann after condition"));

		let body = this.parseBody(TK.ENDE_WENN, TK.SONST);
		if (!body.isOk()) return Err(body.unwrapErr());

		let else_: Stmt[] | null = null;
		if (this.consume(TK.SONST)) {
			let res = this.parseBody(TK.ENDE_WENN);
			if (!res.isOk()) return Err(res.unwrapErr());

			else_ = res.unwrap();
		}
		this.nextToken();

		return Ok(new IfStmt(Span.concat(loc, this.location()), cond.unwrap(), body.unwrap(), else_));
	}

	// TODO: Factor out call and condition
	// <callStmt> ::= <identifier> [([<identifier> | <number>])]
	private parseCall(): Result<CallStmt> {
		let loc = this.location();

		let name = this.currToken.value;
		if (!this.consume(TK.IDENTIFIER)) return Err(new Error(";; WIP ;; Couldn't find Identifier Token in call"));

		let value : string | number | null = null;
		if (this.consume(TK.LPREN)) {
			value = this.at(TK.INT_LITERAL) ? parseInt(this.currToken.value!) : this.currToken.value;
			this.consume(TK.INT_LITERAL, TK.IDENTIFIER);

			if (!this.consume(TK.RPREN)) return Err(new Error(";; WIP ;; Expected ) after call ("));
		}

		return Ok(new CallStmt(Span.concat(loc, this.location()), name!, value));
	}

	// <cond> ::= [nicht] <identifier> [([<identifier> | <number>])]
	private parseCond(): Result<CondStmt> {
		let loc = this.location();

		let not = this.consume(TK.NICHT);

		let name = this.currToken.value;
		if (!this.consume(TK.IDENTIFIER)) return Err(new Error(";; WIP ;; Couldn't find Indentifier Token in condition"));

		let value : string | number | null = null;
		if (this.consume(TK.LPREN)) {
			value = this.at(TK.INT_LITERAL) ? parseInt(this.currToken.value!) : this.currToken.value;
			this.consume(TK.INT_LITERAL, TK.IDENTIFIER);

			if (!this.consume(TK.RPREN)) return Err(new Error(";; WIP ;; Expected ) after condition ("));
		}

		return Ok(new CondStmt(Span.concat(loc, this.location()), name!, not, value));
	}


	// <body> ::= {<stmt>}
	private parseBody(...last: TK[]): Result<Stmt[]> {
		let results: Stmt[] = [];

		while(!this.at(...last)) {
			if (this.at(TK.EOF)) return Err(new Error(";; WIP ;; Reached EOF in body"));

			let stmt = this.parseStmt();
			if (!stmt.isOk()) return Err(stmt.unwrapErr());

			results.push(stmt.unwrap());
		}

		return Ok(results);
	}
}
