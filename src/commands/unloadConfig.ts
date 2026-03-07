import vscode from 'vscode';
import { CommandID } from '../common/enums';
import { loadedConfigsDataProvider, SnippetConfigItem } from '../logics/config';
import { Command } from './common/templates';

export default {
    register(context: vscode.ExtensionContext) {
        return new Command(context, CommandID.UnloadConfig, async (item: SnippetConfigItem) => {
            const result = await vscode.window.showWarningMessage(
                'Confirm to delete it?',
                { modal: true },
                'OK'
            );
            const ok = result === 'OK';
            if (ok) {
                loadedConfigsDataProvider.delete(context, item.id);
            }
            return ok;
        });
    }
};
