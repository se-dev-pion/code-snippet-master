import vscode from 'vscode';
import { configKey, maxSnippetConfigCountLimit } from '../common/constants';
import { ObservableTreeDataProviderTemplate } from './common/templates';
import { extensionConfigState, snippetConfigState } from './state';
import { SnippetConfig } from './schema';
import { UUID } from 'crypto';
import { previewSchema } from './preview';

export class SnippetConfigItem extends vscode.TreeItem {
    public constructor(
        _context: vscode.ExtensionContext, // for open and edit config
        public readonly id: UUID,
        public readonly data: SnippetConfig,
        public readonly label: string = data.root.name,
        public readonly resourceUri = vscode.Uri.parse(`${previewSchema}:/${id}.snippet.xml`)
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = id;
        this.contextValue = `${configKey}.config-item`;
        this.command = {
            command: 'vscode.open',
            title: 'Preview',
            arguments: [resourceUri]
        };
    }
}

class LoadedConfigsDataProvider extends ObservableTreeDataProviderTemplate<SnippetConfigItem> {
    private timer: NodeJS.Timeout | null = null;
    public constructor(
        private data = {} as Record<UUID, SnippetConfigItem>,
        private orders = {} as Record<UUID, number>
    ) {
        super();
    }
    override getTreeItem(element: SnippetConfigItem) {
        return element;
    }
    override getChildren() {
        return Object.values(this.data);
    }
    public save(context: vscode.ExtensionContext, item: SnippetConfigItem) {
        const order = this.data[item.id] ? this.orders[item.id] : Object.keys(this.data).length;
        if (order === maxSnippetConfigCountLimit) {
            vscode.window.showErrorMessage(
                `Snippet configs can only be up to ${maxSnippetConfigCountLimit} !`
            );
            return;
        }
        this.data[item.id] = item;
        this.orders[item.id] = order;
        this.refresh();
        extensionConfigState.set(context, this.orders);
        snippetConfigState.set(context, order, item.data);
    }
    public delete(context: vscode.ExtensionContext, id: UUID) {
        delete this.data[id];
        const order = this.orders[id];
        delete this.orders[id];
        this.refresh();
        extensionConfigState.set(context, this.orders);
        snippetConfigState.del(context, order ?? maxSnippetConfigCountLimit); // handle if order is `undefined`
    }
    public sync(context: vscode.ExtensionContext) {
        this.load(context);
        this.timer =
            this.timer ||
            setInterval(
                () => {
                    this.load(context);
                },
                1000 * 60 * 60
            );
    }
    private load(context: vscode.ExtensionContext) {
        this.data = {};
        this.orders = extensionConfigState.get(context);
        for (const [id, order] of Object.entries(this.orders) as [UUID, number][]) {
            const data = snippetConfigState.get(context, order);
            if (data) {
                this.data[id] = new SnippetConfigItem(context, id, data);
                snippetConfigState.set(context, order, data);
            } else {
                snippetConfigState.del(context, order);
            }
        }
        extensionConfigState.set(context, this.orders);
        this.refresh();
    }
}

export const loadedConfigsDataProvider = new LoadedConfigsDataProvider();
