// @ts-ignore
import { parser } from "./syntax.grammar"
import { foldNodeProp, LRLanguage, foldInside, LanguageSupport, indentNodeProp, continuedIndent, TreeIndentContext } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"
import { SyntaxNode } from "@lezer/common"

const closingKeywordIndent = (word: string): (context: TreeIndentContext) => number | null => {
	return continuedIndent( { except: new RegExp(`^\\s*((ende|\\*)${word})`, "i")} );
}

export const KarolLanguage = LRLanguage.define({
	parser: parser.configure({
		props: [
			indentNodeProp.add({
				FuncDecl: closingKeywordIndent("Anweisung"),
				ProgDecl: closingKeywordIndent("Programm"),
				CondDecl: closingKeywordIndent("Bedingung"),

				"CondLoopStmt IterLoopStmt InftyLoopStmt": closingKeywordIndent("Wiederhole"),
				IfStmt: closingKeywordIndent("Wenn|sonst"),
			}),
			foldNodeProp.add({
				"CondDecl FuncDecl": (node: SyntaxNode): { from: number, to: number } | null => {
					let first = node.firstChild?.nextSibling, last = node.lastChild;

					if (!first || !last) return null;
					return { from: first.to, to: last.from };
				},
				ProgDecl: foldInside,
			}),
			styleTags({
				"Wiederhole Mal Solange EndeWiederhole Wenn Dann Sonst Nicht Immer EndeWenn Anweisung EndeAnweisung Bedingung EndeBedingung Programm EndeProgramm Wahr Falsch": t.keyword,
				"Rot Gruen Schwarz Blau": t.typeName,
				Comment: t.comment,
				VariableName: t.variableName,
				FunctionName: t.className,
				Number: t.number,
				"( )": t.paren
			})
		]
	}),
	languageData: {
		closeBrackets: { brackets: ["{", "("]},
		commentTokens: { open: "{", close: "}" },
		indentOnInput: /^\s*((\*|ende).*|sonst)$/i
	}
})

export const KarolPackage = (): LanguageSupport => new LanguageSupport(KarolLanguage);