import { keymap, highlightSpecialChars, drawSelection, dropCursor, lineNumbers, EditorView, highlightActiveLine } from "@codemirror/view"
import { Extension, EditorState } from "@codemirror/state"
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, foldGutter, foldKeymap, indentUnit } from "@codemirror/language"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { searchKeymap, highlightSelectionMatches} from "@codemirror/search"
import { completionKeymap, closeBracketsKeymap, closeBrackets} from "@codemirror/autocomplete"
import { lintKeymap } from "@codemirror/lint"
import { karolTheme } from "./theme"
import { KarolPackage } from "./grammar/karol"

// Removed: autocompletion, rectangularSelection, highlightActiveLine
export const extensions: Extension = (() => [
    karolTheme,
    KarolPackage(),
    highlightActiveLine(),
    indentUnit.of("    "),
    lineNumbers(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    closeBrackets(),
    highlightSelectionMatches(),
    keymap.of([
    indentWithTab,
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap
    ])
])()

export class Editor {

    constructor() {
        let state = EditorState.create({
            doc: "Anweisung Wurstsalat\n    Schritt(5)\nendeAnweisung",
            extensions: extensions
        });

        let view = new EditorView({
            state: state,
            parent: document.querySelector("#editor")!
        })

    }
}