import { World } from './lib/graphics/world';
import { LanguageError } from './lib/language/error';
import { Interpreter } from './lib/language/interpreter';
import { Lexer } from './lib/language/lexer'
import { Parser } from './lib/language/parser';
import './style/style.css'


fetch("code_pyramide.txt").then((res) => {
  return res.text()
}).then((res) => {
  let lexer = new Lexer(res);
  let tokens = lexer.tokenize();

  if (tokens instanceof LanguageError) return tokens

  console.log(tokens);

  let parser = new Parser(tokens);
  let ast = parser.parse();
  console.log(ast);

  if (ast instanceof LanguageError) return ast

  const ctx = document.querySelector("#three");
  if (!ctx) return
  let world = new World(ctx);
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
    gen.next();
  })
})