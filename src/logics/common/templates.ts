import vscode from 'vscode';

export abstract class ObservableTreeDataProviderTemplate<T> implements vscode.TreeDataProvider<T> {
    private _onDidChangeTreeData: vscode.EventEmitter<T | undefined | null | void>;
    public constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
    }
    public get onDidChangeTreeData() {
        return this._onDidChangeTreeData.event;
    }
    protected refresh() {
        this._onDidChangeTreeData.fire();
    }
    public abstract getTreeItem(element: T): vscode.TreeItem;
    public abstract getChildren(element?: T): vscode.ProviderResult<T[]>;
}

export abstract class ReadonlyFileSystemProvider implements vscode.FileSystemProvider {
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    public get onDidChangeFile() {
        return this._emitter.event;
    }

    public register(context: vscode.ExtensionContext, schema: string) {
        const disposable = vscode.workspace.registerFileSystemProvider(schema, this, {
            isCaseSensitive: true,
            isReadonly: true
        });
        context.subscriptions.push(disposable);
    }

    watch(
        _uri: vscode.Uri,
        _options: { readonly recursive: boolean; readonly excludes: readonly string[] }
    ): vscode.Disposable {
        return { dispose: () => {} };
    }

    writeFile(
        _uri: vscode.Uri,
        _content: Uint8Array,
        _options: { readonly create: boolean; readonly overwrite: boolean }
    ): void | Thenable<void> {}

    delete(_uri: vscode.Uri, _options: { readonly recursive: boolean }): void | Thenable<void> {}

    rename(
        _oldUri: vscode.Uri,
        _newUri: vscode.Uri,
        _options: { readonly overwrite: boolean }
    ): void | Thenable<void> {}

    createDirectory(_uri: vscode.Uri): void | Thenable<void> {}

    public abstract readFile(uri: vscode.Uri): Uint8Array | Thenable<Uint8Array>;

    public abstract stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat>;

    public abstract readDirectory(
        uri: vscode.Uri
    ): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]>;

    public refresh(uri: vscode.Uri) {
        this._emitter.fire([
            {
                type: vscode.FileChangeType.Changed,
                uri
            }
        ]);
    }
}
