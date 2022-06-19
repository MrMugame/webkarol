import { Lexer } from './lib/language/lexer'
import './style/style.css'


fetch("code_pyramide.txt").then((res) => {
  return res.text()
}).then((res) => {
  let lexer = new Lexer(res);
  console.log(lexer.tokenize());
})