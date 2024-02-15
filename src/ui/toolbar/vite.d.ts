// Declarations for vite-markdown-plugin
declare module '*.md' {
    // const toc: { level: string, content: string }[];
    const html: string;
    export { html };
}