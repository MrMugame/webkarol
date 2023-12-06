import "./ui/toolbar/toolbar.ts";

import { Parser } from "./lang/parser.ts";
import { assert } from "./lang/util.ts";
import { MarkColor, World } from "./ui/view/world.ts";
import { BirdeyeView } from "./ui/view/birdeye.ts";

window.onload = async () => {
	let res = await fetch("examples/pyramide.txt");
	assert(res.ok, "Response wasn't ok");

	let world = new World({x: 5, y: 10, z: 5}, new BirdeyeView(document.getElementById("view") as HTMLDivElement));

	world.placeBrick();
	world.step();
	world.placeBrick();
	world.setMark(MarkColor.Yellow);

	let p = new Parser(await res.text());

	console.time();
	let ast = p.parse();
	console.timeEnd();

	if (ast.isOk()) console.log(ast.unwrap());
	else console.log(ast.unwrapErr());
}