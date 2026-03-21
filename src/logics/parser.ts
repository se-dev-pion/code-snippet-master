import vscode from 'vscode';
import JSON5 from 'json5';
import { parseWithSchema, xmlParser } from '../common/utils';
import { CodeSnippets, codeSnippetsSchema, snippetConfigSchema } from './schema';
import path from 'path';
import { FileExtNames } from '../common/enums';

export async function loadSnippetConfig(file: vscode.Uri) {
    const content = await vscode.workspace.fs.readFile(file);
    return parseWithSchema(content, xmlParser, snippetConfigSchema);
}

export async function loadNativeSnippet(file: vscode.Uri) {
    const extname = path.extname(file.path);
    const extnameWithoutDot = extname.replace('.', '');
    const schema = codeSnippetsSchema[extnameWithoutDot];
    if (!schema) {
        throw new Error('Invalid File Format');
    }
    const basename = path.basename(file.path, extname);
    const content = await vscode.workspace.fs.readFile(file);
    const result = parseWithSchema(content, JSON5, schema);
    if (extnameWithoutDot === FileExtNames.CodeSnippetsForLanguage) {
        Object.values(result).forEach(item => {
            item.scope = basename;
        });
    }
    return [basename, result] as [string, CodeSnippets];
}
