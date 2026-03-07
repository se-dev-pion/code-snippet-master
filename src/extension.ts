import * as vscode from 'vscode';
import { mountSnippetConfigs, registerBuiltInSnippets } from './services/snippets';
import { syncDataCrossDevice } from './services/storage';
import commands from './commands';
import views from './views';
import { addHighlightToPlaceholders } from './services/highlight';

export async function activate(context: vscode.ExtensionContext) {
    commands.init(context);
    views.init(context);
    await mountSnippetConfigs(context);
    registerBuiltInSnippets(context);
    syncDataCrossDevice(context);
    addHighlightToPlaceholders(context);
}
