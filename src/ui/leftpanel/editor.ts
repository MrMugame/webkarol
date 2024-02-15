import { keymap, drawSelection, dropCursor, lineNumbers, EditorView, highlightActiveLine, ViewUpdate, Decoration } from "@codemirror/view"
import { Extension, EditorState, StateField, StateEffect } from "@codemirror/state"
import { indentOnInput, foldGutter, foldKeymap, indentUnit } from "@codemirror/language"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { closeBracketsKeymap, closeBrackets } from "@codemirror/autocomplete"
import { lintKeymap } from "@codemirror/lint"
import { karolTheme } from "./theme"
import { KarolPackage } from "./grammar/karol"

const persistentContent = EditorView.updateListener.of((update: ViewUpdate) => {
    if (!update.docChanged) return;
    localStorage.setItem("editor-content", update.state.doc.toString());
});

// https://codemirror.net/docs/migration/
const lineDecoration = Decoration.line({
    attributes: {class: "cm-execLine"}
});

const highlightLineEffect = StateEffect.define<number>();
const highlightLineEffectReset = StateEffect.define();

const markLine = StateField.define({
    create() { return Decoration.none },

    update(value, transaction) {
        value = value.map(transaction.changes);

        for (let effect of transaction.effects) {
            if (effect.is(highlightLineEffect)) {
                value = Decoration.none;
                value = value.update({add: [lineDecoration.range(transaction.newDoc.line(effect.value).from)]});
            } else if (effect.is(highlightLineEffectReset)) {
                value = Decoration.none;
            }
        }

        return value;
    },

    provide: f => EditorView.decorations.from(f)
})


// Removed: autocompletion, rectangularSelection, highlightActiveLine
const extensions: Extension = [
    markLine,
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
    private view: EditorView;

    constructor(element: HTMLElement) {
        let state = EditorState.create({
            doc: localStorage.getItem("editor-content") || "",
            extensions: extensions
        });

        this.view = new EditorView({
            state: state,
            parent: element
        })
    }

    getText(): string {
        return this.view.state.doc.toString();
    }

    setText(text: string) {
        this.view.setState(EditorState.create({
            doc: text,
            extensions: extensions
        }));
        localStorage.setItem("editor-content", text);
    }

    highlightLine(lineNumber: number) {
        this.view.dispatch({
            effects: highlightLineEffect.of(lineNumber)
        });
    }

    highlightLineReset() {
        this.view.dispatch({
            effects: highlightLineEffectReset.of(null)
        });
    }
}