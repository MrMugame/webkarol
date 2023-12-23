import "./ui/controller.ts";

import { Parser } from "./lang/parser.ts";
import { assert } from "./lang/util.ts";
import { World } from "./ui/view/world.ts";
import { BirdeyeView } from "./ui/view/birdeye.ts";
import { Interpreter } from "./lang/interpreter.ts";
import { Editor } from "./ui/leftpanel/editor.ts";

// window.onload = async () => {
// 	let editor = new Editor();

// 	let res = await fetch("examples/pyramide.txt");
// 	assert(res.ok, "Response wasn't ok");

// 	let world = new World({x: 5, y: 10, z: 5}, new BirdeyeView(document.getElementById("view") as HTMLDivElement));

// 	let p = new Parser(await res.text());

// 	console.time();
// 	let ast = p.parse();
// 	console.timeEnd();

// 	if (ast.isOk()) {
// 		console.log(ast.unwrap());

// 		let int = new Interpreter(ast.unwrap(), world);

// 		let gen = int.interpret();
// 		while (true) {
// 			let val = gen.next();
// 			if (val.done) {
// 				if (!val.value.isOk()) console.log(val.value.unwrapErr());
// 				break;
// 			}
// 		}
// 	}
// 	else console.log(ast.unwrapErr());
// }