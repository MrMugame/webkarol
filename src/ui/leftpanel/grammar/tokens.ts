import {
    Anweisung,
    Wiederhole,
    Mal,
    Solange,
    EndeWiederhole,
    Wenn,
    Dann,
    Sonst,
    Nicht,
    Immer,
    EndeWenn,
    EndeAnweisung,
    Bedingung,
    EndeBedingung,
    Programm,
    EndeProgramm,
    Wahr,
    Falsch,

    Rot,
    Gelb,
    Blau,
    Gruen,
    Schwarz
} from "./parser.terms.js";

const keywordMap: Map<string, any> = new Map([
    ["wiederhole", Wiederhole],
    ["mal", Mal],
    ["solange", Solange],
    ["endewiederhole", EndeWiederhole],
    ["*wiederhole", EndeWiederhole],
    ["wenn", Wenn],
    ["dann", Dann],
    ["sonst", Sonst],
    ["nicht", Nicht],
    ["immer", Immer],
    ["endewenn", EndeWenn],
    ["anweisung", Anweisung],
    ["endeanweisung", EndeAnweisung],
    ["*anweisung", EndeAnweisung],
    ["bedingung", Bedingung],
    ["endebedingung", EndeBedingung],
    ["*bedingung", EndeBedingung],
    ["programm", Programm],
    ["endeprogramm", EndeProgramm],
    ["*programm", EndeProgramm],
    ["wahr", Wahr],
    ["falsch", Falsch],
]);

export function keywords(name: string) {
    return keywordMap.get(name.toLowerCase()) || -1;
}

const colorMap: Map<string, any> = new Map([
    ["rot", Rot],
    ["gelb", Gelb],
    ["blau", Blau],
    ["grün", Gruen],
    ["schwarz", Schwarz]
]);

export function colors(name: string) {
    return colorMap.get(name.toLowerCase()) || -1;
}