import { copy } from "./util";

enum TokenType {
	// Keywords
	WIEDERHOLE,
	MAL,
	SOLANGE,
	ENDE_WIEDERHOLE,
	WENN,
	DANN,
	SONST,
	NICHT,
	IMMER,
	ENDE_WENN,
	ANWEISUNG,
	ENDE_ANWEISUNG,
	BEDINGUNG,
	ENDE_BEDINGUNG,
	PROGRAMM,
	ENDE_PROGRAMM,
	WAHR,
	FALSCH,

	// Symbols
	LPREN,
	RPREN,

	// Specials
	IDENTIFIER,
	INT_LITERAL,
	EOF,
	INVALID,
}


class Span {
	constructor(
		readonly start: Span.Position,
		readonly end: Span.Position
	) {}

	public static concat(start: Span, end: Span) {
		return new Span(copy(start.start), copy(end.end));
	}
}
namespace Span {
	export type Position = {
		line: number,
		column: number,
	}
}

class Token {
	constructor(
		readonly type: TokenType,
		readonly position: Span,
		readonly value: string|null
	) {}
}

const KEYWORDS = new Map<string, TokenType>([
	[ "wiederhole", TokenType.WIEDERHOLE ],
	[ "mal", TokenType.MAL ],
    [ "solange", TokenType.SOLANGE ],
	[ "endewiederhole", TokenType.ENDE_WIEDERHOLE ],
	[ "*wiederhole", TokenType.ENDE_WIEDERHOLE ],
	[ "wenn", TokenType.WENN ],
	[ "dann", TokenType.DANN ],
	[ "sonst", TokenType.SONST ],
	[ "nicht", TokenType.NICHT ],
	[ "immer", TokenType.IMMER ],
	[ "endewenn", TokenType.ENDE_WENN ],
	[ "*wenn", TokenType.ENDE_WENN ],
	[ "methode", TokenType.ANWEISUNG ],
	[ "anweisung", TokenType.ANWEISUNG ],
	[ "endeanweisung", TokenType.ENDE_ANWEISUNG ],
	[ "*anweisung", TokenType.ENDE_ANWEISUNG ],
	[ "endemethode", TokenType.ENDE_ANWEISUNG ],
	[ "*methode", TokenType.ENDE_ANWEISUNG ],
	[ "bedingung", TokenType.BEDINGUNG ],
	[ "endebedingung", TokenType.ENDE_BEDINGUNG ],
	[ "*bedingung", TokenType.ENDE_BEDINGUNG ],
	[ "programm", TokenType.PROGRAMM ],
	[ "endeprogramm", TokenType.ENDE_PROGRAMM ],
	[ "*programm", TokenType.ENDE_PROGRAMM ],
	[ "wahr", TokenType.WAHR ],
	[ "falsch", TokenType.FALSCH ]
]);


export { Token, Span, TokenType, KEYWORDS }
