import vscode from 'vscode';
import { TreeView } from './common/templates';
import { ViewID } from '../common/enums';
import { loadedConfigsDataProvider } from '../logics/config';

export default {
    register(context: vscode.ExtensionContext) {
        return new TreeView(context, ViewID.LoadedConfigs, loadedConfigsDataProvider);
    }
};
