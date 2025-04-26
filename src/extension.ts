import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  function createHighlightDecoration(): vscode.TextEditorDecorationType {
    const config = vscode.workspace.getConfiguration('commentHighlighter');
    let color = config.get<string>('color', '#ff5794') || '#ff5794';
    if (color[0] !== '#') {
      color = `#${color}`;
    }
    return vscode.window.createTextEditorDecorationType({
      color: color,
      fontWeight: 'bold',
    });
  }

  let highlightDecoration = createHighlightDecoration();

  const updateDecorations = (editor: vscode.TextEditor) => {
    if (!editor) {
      return;
    }
    const regEx = /\/\/.*$|\/\*[\s\S]*?\*\//gm;
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

    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('commentHighlighter.color')) {
        if (highlightDecoration) {
          highlightDecoration.dispose();
        }
        highlightDecoration = createHighlightDecoration();

        const editor = vscode.window.activeTextEditor;
        if (editor && isSupportedLanguage(editor.document.languageId)) {
          updateDecorations(editor);
        }
      }
    }),
  );
}

export function deactivate() {}

const isSupportedLanguage = (languageId: string) => languageId === 'javascript' || languageId === 'typescript';
