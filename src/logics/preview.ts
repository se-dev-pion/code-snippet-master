import vscode from 'vscode';
import { extensionConfigState, snippetConfigState } from './state';
import { UUID } from 'crypto';
import { serialize, xmlBuilder } from '../common/utils';
import { ReadonlyFileSystemProvider } from './common/templates';
import path from 'path';

export const previewSchema = 'sncfg';

export class PreviewVirtualFileSystemProvider extends ReadonlyFileSystemProvider {
    public constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly encoder = new TextEncoder()
    ) {
        super();
    }

    private getId(uri: vscode.Uri) {
        return path.basename(uri.path, '.snippet.xml').replace('/', '') as UUID;
    }

    override async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        const id = this.getId(uri);
        const order = extensionConfigState.get(this.context)[id];
        const data = snippetConfigState.get(this.context, order);
        return {
            type: data ? vscode.FileType.File : vscode.FileType.Unknown,
            ctime: 0,
            mtime: data ? Date.now() : 0,
            size: data ? JSON.stringify(data).length : 0,
            permissions: vscode.FilePermission.Readonly
        };
    }

    override async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        const id = this.getId(uri);
        const order = extensionConfigState.get(this.context)[id];
        const data = snippetConfigState.get(this.context, order)!;
        const content = serialize(data, xmlBuilder)
            .replaceAll(/(<[a-zA-Z][^>]*>)\s*(<!\[CDATA\[)/g, '$1$2')
            .replaceAll(/(\]\]>)\s*(<\/[a-zA-Z][^>]*>)/g, '$1$2');
        return this.encoder.encode(content);
    }

    override readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
        return [];
    }

    override register(context: vscode.ExtensionContext): void {
        super.register(context, previewSchema);
    }
}
