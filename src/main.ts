
// fetch("code_pyramide.txt").then((res) => {
//   return res.text()
// }).then((res) => {
//   let lexer = new Lexer(res);
//   let tokens = lexer.tokenize();

import { Handler } from "./lib/frontend/handler";
import "./style/style.css"

//   if (tokens instanceof LanguageError) return tokens

//   console.log(tokens);

//   let parser = new Parser(tokens);
//   let ast = parser.parse();
//   console.log(ast);

//   if (ast instanceof LanguageError) return ast

//   const ctx = document.querySelector("#three");
//   if (!ctx) return
//   let world = new World(ctx);
//   let interpreter = new Interpreter(world, ast);
//   let gen = interpreter.run()
//   const run = () => {
//       world.animate();
//       gen.next();
//       window.requestAnimationFrame(run.bind(this));
//   }
//   run()


//   let button = document.querySelector("#btn")
//   button?.addEventListener("click", () => {
//     gen.next();
//   })
// })


const handler = new Handler({
    workspace: "#three",
    editor: "#editor",
    output: '#out',
    playbutton: '#play',
    pausebutton: '#pause',
    fastbutton: '#fast',
    stepbutton: '#step',
    resetbutton: '#reset'
});