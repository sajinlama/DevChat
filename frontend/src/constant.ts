
export const LANGUAGE_VERSIONS: Record<string, string> = {
    javascript: "18.15.0",
    typescript: "5.0.3",
    python: "3.10.0",
    java: "15.0.2",
    csharp: "6.12.0",
    php: "8.2.3",
  };
export const CODE_SNIPPETS: Record<string, string> = {
    javascript: `\nconsole.log("Hello, World!");\n`,
    typescript: `\nconsole.log("Hello, World!");\n`,
    python: `\nprint("Hello, World!")\n`,
    java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}\n`,
    csharp: `\nusing System;\n\nnamespace HelloWorld\n{\n\tclass Hello { \n\t\tstatic void Main(string[] args) {\n\t\t\tConsole.WriteLine("Hello, World!");\n\t\t}\n\t}\n}\n`,
    php: `\n<?php\n\necho "Hello, World!";\n`,
  };
  