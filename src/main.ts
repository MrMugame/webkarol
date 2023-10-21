import { Lexer } from "./lib/lexer"
import { TokenType } from "./lib/tokens";

window.onload = () => {
	let l = new Lexer("Anweisung { Test() \"Hello World\" *Anweisung {Comment");

	let i = 0;
	while (l.currToken.type != TokenType.EOF && i < 100) {
		l.next_token();
		console.log(l.currToken);
		i++;
	}
}
