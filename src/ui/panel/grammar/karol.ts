// @ts-ignore
import { parser } from "./syntax.grammar"
import { foldNodeProp, foldInside, LRLanguage, LanguageSupport } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"

// function foldCompletly(node: any) {
// 	let first = node.firstChild, last = node.lastChild;
// 	return { from: first.from, to: last.to };
// }

export const KarolLanguage = LRLanguage.define({
	parser: parser.configure({
		props: [
			//  indentNodeProp.add({
			//    //Application: delimitedIndent({closing: ")", align: false})
			//  }),
			//  foldNodeProp.add({
			//   Body: foldCompletly,
			//  }),
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
		commentTokens: { open: "{", close: "}" }
	}
})

export const KarolPackage = () => new LanguageSupport(KarolLanguage);