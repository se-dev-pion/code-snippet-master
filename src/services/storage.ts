import vscode from 'vscode';
import { loadedConfigsDataProvider } from '../logics/config';
import { extensionConfigState, snippetConfigState } from '../logics/state';
import { maxSnippetConfigCountLimit } from '../common/constants';

export function syncDataCrossDevice(context: vscode.ExtensionContext) {
    const stateKeys = Array.from({ length: maxSnippetConfigCountLimit }, (_, i: number) =>
        snippetConfigState.key(context, i)
    ).concat([extensionConfigState.key(context)]);
    context.globalState.setKeysForSync(stateKeys);
    loadedConfigsDataProvider.sync(context);
}
