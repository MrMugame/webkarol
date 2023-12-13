import { keymap, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, lineNumbers, EditorView } from "@codemirror/view"
import { Extension, EditorState } from "@codemirror/state"
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, foldGutter, foldKeymap } from "@codemirror/language"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { searchKeymap, highlightSelectionMatches} from "@codemirror/search"
import { autocompletion, completionKeymap, closeBracketsKeymap} from "@codemirror/autocomplete"
import { lintKeymap } from "@codemirror/lint"
import { oneDark } from "./onedark"
import { KarolPackage } from "./grammar/karol"

export const basicSetup: Extension = (() => [
    lineNumbers(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
    autocompletion(),
    rectangularSelection(),
    //crosshairCursor(),
    //highlightActiveLine(),
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
            doc: "Anweisung Wurstsalat\n  Schritt(5)\nendeAnweisung",
            extensions: [basicSetup, oneDark, KarolPackage()]
        });

        let view = new EditorView({
            state: state,
            parent: document.querySelector("#editor")!
        })

    }
}