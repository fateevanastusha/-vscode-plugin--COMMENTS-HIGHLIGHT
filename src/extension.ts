import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const highlightDecoration = vscode.window.createTextEditorDecorationType({
    color: '#FF8800',
    fontWeight: 'bold',
  });

  const updateDecorations = (editor: vscode.TextEditor) => {
    if (!editor) {
      return;
    }
    const regEx = /(\/\/\s*TODO:.*$)/gm;
    const text = editor.document.getText();
    const decorations: vscode.DecorationOptions[] = [];

    let match;
    while ((match = regEx.exec(text))) {
      const startPos = editor.document.positionAt(match.index);
      const endPos = editor.document.positionAt(match.index + match[0].length);
      decorations.push({
        range: new vscode.Range(startPos, endPos),
      });
    }

    editor.setDecorations(highlightDecoration, decorations);
  };

  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor && isSupportedLanguage(activeEditor.document.languageId)) {
    updateDecorations(activeEditor);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && isSupportedLanguage(editor.document.languageId)) {
        updateDecorations(editor);
      }
    }),

    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document && isSupportedLanguage(editor.document.languageId)) {
        updateDecorations(editor);
      }
    }),
  );
}

export function deactivate() {}

const isSupportedLanguage = (languageId: string) => languageId === 'javascript' || languageId === 'typescript';
