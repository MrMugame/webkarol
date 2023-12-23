import { keymap, highlightSpecialChars, drawSelection, dropCursor, lineNumbers, EditorView, highlightActiveLine, ViewUpdate } from "@codemirror/view"
import { Extension, EditorState } from "@codemirror/state"
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, foldGutter, foldKeymap, indentUnit } from "@codemirror/language"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { searchKeymap, highlightSelectionMatches} from "@codemirror/search"
import { completionKeymap, closeBracketsKeymap, closeBrackets} from "@codemirror/autocomplete"
import { lintKeymap } from "@codemirror/lint"
import { karolTheme } from "./theme"
import { KarolPackage } from "./grammar/karol"

const persistentContent = EditorView.updateListener.of((update: ViewUpdate) => {
    if (!update.docChanged) return;
    localStorage.setItem("editor-content", update.state.doc.toString());
});

// Removed: autocompletion, rectangularSelection, highlightActiveLine
const extensions: Extension = [
    persistentContent,
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
    ...lintKeymap
    ])
]

export class Editor {

    constructor() {
        let state = EditorState.create({
            doc: localStorage.getItem("editor-content") || "",
            extensions: extensions
        });

        let view = new EditorView({
            state: state,
            parent: document.querySelector("#editor")!
        })

    }
}