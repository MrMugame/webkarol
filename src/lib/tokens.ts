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
}
namespace Span {
	export interface Position {
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
	[ "endewenn", TokenType. ENDE_WENN ],
	[ "*wenn", TokenType.ENDE_WENN ],
	[ "Anweisung", TokenType.ANWEISUNG ],
	[ "endeAnweisung", TokenType.ENDE_ANWEISUNG ],
	[ "*Anweisung", TokenType.ENDE_ANWEISUNG ],
	[ "Bedingung", TokenType.BEDINGUNG ],
	[ "endeBedingung", TokenType.ENDE_BEDINGUNG ],
	[ "*Bedingung", TokenType.ENDE_BEDINGUNG ],
	[ "Programm", TokenType.PROGRAMM ],
	[ "endeProgramm", TokenType.ENDE_PROGRAMM ],
	[ "*Programm", TokenType.ENDE_PROGRAMM ],
	[ "wahr", TokenType.WAHR ],
	[ "falsch", TokenType.FALSCH ]
]);


export { Token, Span, TokenType, KEYWORDS }
