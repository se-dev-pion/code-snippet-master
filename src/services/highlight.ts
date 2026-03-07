import vscode from 'vscode';
import { extractPlaceholderAreas } from '../logics/snippets';
import { debounced } from '../common/utils';

export function addHighlightToPlaceholders(context: vscode.ExtensionContext) {
    const placeholderDecoration = vscode.window.createTextEditorDecorationType({
        color: new vscode.ThemeColor('editor.background'),
        backgroundColor: new vscode.ThemeColor('editor.foreground'),
        fontWeight: 'bold'
    });
    const updateDecorations = debounced(() => {
        for (const editor of vscode.window.visibleTextEditors) {
            const placeholderRanges = extractPlaceholderAreas(editor.document);
            editor.setDecorations(placeholderDecoration, placeholderRanges);
        }
    }, 50);
    updateDecorations();
    context.subscriptions.push(
        placeholderDecoration,
        vscode.workspace.onDidChangeTextDocument(updateDecorations),
        vscode.window.onDidChangeVisibleTextEditors(updateDecorations),
        vscode.window.onDidChangeTextEditorVisibleRanges(updateDecorations),
        vscode.window.onDidChangeActiveColorTheme(updateDecorations)
    );
}
