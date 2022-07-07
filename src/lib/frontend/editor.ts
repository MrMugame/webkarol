import { CodeJar } from 'codejar';
import { withLineNumbers } from 'codejar/linenumbers';
import { LanguageError } from '../language/error';
import { Lexer } from '../language/lexer';
import { Tokens } from '../language/types';

export class Editor {
    offset: number;
    editor: HTMLElement;
    jar: any;

    constructor(element: HTMLElement) {
        this.offset = 0;
        this.editor = element;
        this.jar = CodeJar(this.editor, withLineNumbers(this.highlight.bind(this)), {tab: '\t'});
    }

    private highlight() {   
        this.offset = 0;

        let code = this.editor.textContent || "";

        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();
        if (tokens instanceof LanguageError) {
            return
        } 
    
        for (let [idx, token] of tokens.entries()) {
            if (token.type === Tokens.Keyword) {
                let col = "#569CD6";
                if (token.match(Tokens.Keyword, "Anweisung", "*Anweisung") || token.match(Tokens.Keyword, "Bedingung", "*Bedingung") || token.match(Tokens.Keyword, "endeAnweisung", "endeBedingung")) {
                    col = "#D197D9"
                }
                code = this.insertColor(code, token.posStart.index, token.posEnd.index, col);
            } else if (token.type === Tokens.Identifier) {
                let col = "#DCDCAA";
                if (tokens[idx-1]?.match(Tokens.Keyword, "Anweisung") || tokens[idx-1]?.match(Tokens.Keyword, "Bedingung")) {
                    col = "#4EC9B0";
                } else if (tokens[idx-1]?.match(Tokens.Keyword, "wenn") || tokens[idx-1]?.match(Tokens.Keyword, "solange")) {
                    col = "#BED6FF";
                }
                code = this.insertColor(code, token.posStart.index, token.posEnd.index, col);
            } else if (token.type === Tokens.String) {
                code = this.insertColor(code, token.posStart.index, token.posEnd.index, "#CE9178");
            } else if (token.type === Tokens.Integer) {
                code = this.insertColor(code, token.posStart.index, token.posEnd.index, "#7FB347");
            } else if (token.type === Tokens.Comment) {
                code = this.insertColor(code, token.posStart.index, token.posEnd.index, "#608B4E");
            }
        }
    
        this.editor.innerHTML = code;
    }

    insertColor(text: string, idxStart: number, idxEnd: number, col: string) {
        let col_string = '<font color="' + col + '">';
        text = text.slice(0, idxStart+this.offset) + col_string + text.slice(idxStart+this.offset);

        let end_string = '</font>'
        text = text.slice(0, idxEnd+this.offset+col_string.length) + end_string + text.slice(idxEnd+this.offset+col_string.length);

        this.offset += col_string.length + end_string.length;
        return text
    }

    getCode() {
        return this.jar.toString();
    }
}