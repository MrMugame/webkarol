import { World } from './lib/graphics/World';
import { isLanguageError } from './lib/language/error';
import { Interpreter } from './lib/language/interpreter';
import { Lexer } from './lib/language/lexer'
import { Parser } from './lib/language/parser';
import './style/style.css'


fetch("code_pyramide.txt").then((res) => {
  return res.text()
}).then((res) => {
  let lexer = new Lexer(res);
  let tokens = lexer.tokenize();

  if (isLanguageError(tokens)) return tokens

  console.log(tokens);

  let parser = new Parser(tokens);
  let ast = parser.parse();
  console.log(ast);

  if (isLanguageError(ast)) return ast

  let world = new World("#three")
  let interpreter = new Interpreter(world, ast);
  let gen = interpreter.run()
  const run = () => {
      world.animate();
      gen.next();
      window.requestAnimationFrame(run.bind(this));
  }
  run()


  let button = document.querySelector("#btn")
  button?.addEventListener("click", () => {
    interpreter.interpret();
  })
})