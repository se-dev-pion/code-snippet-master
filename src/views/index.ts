import vscode from 'vscode';
import loadedConfigs from './loadedConfigs';

export default {
    init(context: vscode.ExtensionContext) {
        [loadedConfigs].forEach(view => view.register(context));
    }
};
