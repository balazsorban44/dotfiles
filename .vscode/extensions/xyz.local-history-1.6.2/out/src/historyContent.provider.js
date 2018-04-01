"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
class HistoryContentProvider {
    constructor(controller) {
        this.controller = controller;
        this._onDidChange = new vscode.EventEmitter();
        this.contentSettings = new Map();
    }
    showViewer(editor) {
        const uri = this.encodeEditor(editor);
        this.contentSettings.delete(uri.toString());
        return vscode.commands.executeCommand('vscode.previewHtml', uri, Math.min(editor.viewColumn + 1, 3), 'Local history')
            .then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    }
    compare(file1, file2, column) {
        if (file1 && file2)
            this.controller.compare(file1, file2, column);
        else
            vscode.window.showErrorMessage('Select 2 history files to compare');
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    // Called from HtmlPreview when click on refresh/more
    refresh(providerUri, all) {
        // TODO investigate server usage for better communication between extension and preivewHtml
        this.contentSettings.set(providerUri.toString(), { all: all });
        this._onDidChange.fire(providerUri);
    }
    // Called when save file
    refreshDocument(document) {
        this._onDidChange.fire(this.encodeProviderUri(document.fileName, 1));
    }
    delete(providerUri, fileUri, all) {
        const fn = all ? this.controller.deleteHistory : this.controller.deleteFile;
        fn.call(this.controller, fileUri.fsPath)
            .then(() => this._onDidChange.fire(providerUri));
    }
    /**
     * Provider method that takes an uri of the scheme and
     * resolves its content by creating the html document
     */
    provideTextDocumentContent(uri) {
        return new Promise((resolve, reject) => {
            const [filename, column] = this.decodeEditor(uri);
            const contentSettings = this.contentSettings.get(uri.toString());
            const settings = this.controller.getSettings(vscode.Uri.file(filename));
            this.controller.findAllHistory(filename, settings, (contentSettings && contentSettings.all) || false)
                .then(fileProperties => {
                const files = fileProperties && fileProperties.history;
                let contentFiles = [];
                if (files && files.length) {
                    contentFiles = contentFiles.concat(this.buildContentFiles(filename, column, filename, settings));
                    contentFiles = contentFiles.concat(this.buildContentFiles(files, column, filename, settings));
                }
                // __dirname = out/src
                const dirname = path.join(__dirname, '../../resources/preview');
                const currentFile = vscode.Uri.file(filename);
                const pug = require('pug');
                pug.renderFile(path.join(dirname, 'history.pug'), {
                    baseDir: path.join(dirname, '/'),
                    currentFile: currentFile,
                    currentSearch: settings.enabled ? path.relative(settings.historyPath, fileProperties.file) : 'none',
                    column: column,
                    files: contentFiles,
                    workspaceRoot: settings.folder ? settings.folder.fsPath : 'none',
                    historyPath: settings.historyPath,
                    providerUri: uri
                }, function (err, html) {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    return resolve(html);
                });
            })
                .catch((err) => {
                console.log(err);
                return reject(err);
            });
        });
    }
    buildContentFiles(files, column, current, settings) {
        let properties;
        if (!(files instanceof Array)) {
            properties = this.controller.decodeFile(files, settings, false);
            return [this.getContentFile(properties.file, column, properties.name + properties.ext, current === properties.file, true)];
        }
        else {
            let result = [];
            // desc order history
            for (let index = files.length - 1, file; index >= 0; index--) {
                file = files[index].replace(/\//g, path.sep);
                properties = this.controller.decodeFile(file, settings);
                result.push(this.getContentFile(properties.file, column, properties.date.toLocaleString(settings.dateLocale), current === properties.file));
            }
            return result;
        }
    }
    getContentFile(file, column, caption, checked, current) {
        return {
            caption: caption,
            uri: vscode.Uri.file(file),
            isChecked: checked,
            isCurrent: current
        };
    }
    encodeEditor(editor) {
        return this.encodeProviderUri(editor.document.fileName, editor.viewColumn);
    }
    encodeProviderUri(fileName, viewColumn) {
        const query = JSON.stringify([fileName, viewColumn]);
        return vscode.Uri.parse(`${HistoryContentProvider.scheme}:Viewer.local-history?${query}`);
    }
    decodeEditor(uri) {
        let [filename, column] = JSON.parse(uri.query);
        return [filename, column];
    }
}
HistoryContentProvider.scheme = 'local-history';
exports.default = HistoryContentProvider;
//# sourceMappingURL=historyContent.provider.js.map