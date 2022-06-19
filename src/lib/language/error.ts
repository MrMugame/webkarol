export interface LanguageError {
    text: string
}

export const isLanguageError = (obj: any): obj is LanguageError => {
    return 'text' in obj
}
  