export interface LanguageError {
    text: string
}

export const isLanguageError = (obj: any): obj is LanguageError => {
    return 'text' in obj
}

export interface RuntimeError {
    err: string
}

export const isRuntimeError = (obj: any): obj is RuntimeError => {
    if (typeof obj !== "object") return false
    return 'err' in (obj || {})
}