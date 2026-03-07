import vscode from 'vscode';
import { configKey } from '../../common/utils';
import { ViewID } from '../../common/enums';

export class TreeView {
    public constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly id: ViewID,
        private readonly provider: vscode.TreeDataProvider<any>
    ) {
        vscode.window.registerTreeDataProvider(this.fullID, this.provider);
    }
    private get fullID() {
        return `${configKey(this.context)}.${this.id}`;
    }
}
