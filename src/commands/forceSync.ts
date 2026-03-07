import vscode from 'vscode';
import { CommandID } from '../common/enums';
import { Command } from './common/templates';
import { loadedConfigsDataProvider } from '../logics/config';

export default {
    register(context: vscode.ExtensionContext) {
        return new Command(context, CommandID.ForceSync, () => {
            loadedConfigsDataProvider.sync(context);
        });
    }
};
