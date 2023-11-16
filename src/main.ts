import { Parser } from "./lib/parser";
import { assert } from "./lib/util";

window.onload = async () => {
	let res = await fetch("examples/pyramide.txt");
	assert(res.ok, "Response wasn't ok");
	
	let p = new Parser(await res.text());

	let ast = p.parse();

	if (ast.isOk()) console.log(ast.unwrap());
	else console.log(ast.unwrapErr());
}
