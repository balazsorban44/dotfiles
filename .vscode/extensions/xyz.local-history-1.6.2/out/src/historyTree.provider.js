"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
class HistoryTreeProvider {
    constructor(controller) {
        this.controller = controller;
        /* tslint:disable */
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        // save historyItem structure to be able to redraw
        this.tree = {}; // {yesterday: {grp: HistoryItem, items: HistoryItem[]}}
        this.noLimit = false;
        this.selectIconPath = {
            light: path.join(__filename, '..', '..', '..', 'resources', 'images', 'light', 'selection.png'),
            dark: path.join(__filename, '..', '..', '..', 'resources', 'images', 'dark', 'selection.png')
        };
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return new Promise(resolve => {
            // redraw
            const keys = Object.keys(this.tree);
            if (keys && keys.length) {
                if (!element) {
                    const items = [];
                    keys.forEach(key => items.push(this.tree[key].grp));
                    return resolve(items);
                }
                else if (this.tree[element.label].items) {
                    return resolve(this.tree[element.label].items);
                }
            }
            // rebuild
            let items = [];
            if (!element) {
                if (!this.historyFiles) {
                    if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document)
                        return resolve(items);
                    const filename = vscode.window.activeTextEditor.document.uri;
                    const settings = this.controller.getSettings(filename);
                    this.loadHistoryFile(filename, settings)
                        .then(() => {
                        items = this.loadHistoryGroups(this.historyFiles);
                        resolve(items);
                    });
                }
                else {
                    items = this.loadHistoryGroups(this.historyFiles);
                    resolve(items);
                }
            }
            else {
                if (element.kind === 1 /* Group */) {
                    this.historyFiles[element.label].forEach((file) => {
                        items.push(new HistoryItem(this.format(file), vscode.Uri.file(file.file), element.label));
                    });
                    this.tree[element.label].items = items;
                }
                resolve(items);
            }
        });
    }
    loadHistoryFile(fileName, settings) {
        return new Promise((resolve, reject) => {
            this.controller.findAllHistory(fileName.fsPath, settings, this.noLimit)
                .then(fileProperties => {
                // Current file
                const historyFile = this.controller.decodeFile(fileName.fsPath, settings);
                this.currentHistoryFile = historyFile && historyFile.file;
                // History files
                this.historyFiles = {};
                this.format = (file) => file.date.toLocaleString(settings.dateLocale);
                let grp = 'new';
                const files = fileProperties && fileProperties.history;
                if (files && files.length)
                    files.reverse()
                        .map(file => this.controller.decodeFile(file, settings))
                        .forEach(file => {
                        if (grp !== 'Older') {
                            grp = this.getRelativeDate(file.date);
                            if (!this.historyFiles[grp])
                                this.historyFiles[grp] = [file];
                            else
                                this.historyFiles[grp].push(file);
                        }
                        else {
                            this.historyFiles[grp].push(file);
                        }
                    });
                return resolve(this.historyFiles);
            });
        });
    }
    loadHistoryGroups(historyFiles) {
        const items = [], keys = historyFiles && Object.keys(historyFiles);
        if (keys && keys.length > 0)
            keys.forEach((key) => {
                const item = new HistoryItem(key);
                this.tree[key] = { grp: item };
                items.push(item);
            });
        else
            items.push(new HistoryItem());
        return items;
    }
    getRelativeDate(fileDate) {
        const hour = 60 * 60, day = hour * 24, ref = fileDate.getTime() / 1000;
        if (!this.date) {
            const dt = new Date(), now = dt.getTime() / 1000, today = dt.setHours(0, 0, 0, 0) / 1000; // clear current hour
            this.date = {
                now: now,
                today: today,
                week: today - ((dt.getDay() || 7) - 1) * day,
                month: dt.setDate(1) / 1000,
                eLastMonth: dt.setDate(0) / 1000,
                lastMonth: dt.setDate(1) / 1000 // 1st day of previous month
            };
        }
        if (this.date.now - ref < hour)
            return 'In the last hour';
        else if (ref > this.date.today)
            return 'Today';
        else if (ref > this.date.today - day)
            return 'Yesterday';
        else if (ref > this.date.week)
            return 'This week';
        else if (ref > this.date.week - (day * 7))
            return 'Last week';
        else if (ref > this.date.month)
            return 'This month';
        else if (ref > this.date.lastMonth)
            return 'Last month';
        else
            return 'Older';
    }
    changeItemSelection(select, item) {
        if (select)
            item.iconPath = this.selectIconPath;
        else
            delete item.iconPath;
    }
    redraw() {
        this._onDidChangeTreeData.fire();
    }
    changeActiveFile() {
        const filename = vscode.window.activeTextEditor.document.uri;
        const settings = this.controller.getSettings(filename);
        const prop = this.controller.decodeFile(filename.fsPath, settings, false);
        if (!prop || prop.file !== this.currentHistoryFile)
            this.refresh();
    }
    refresh(noLimit = false) {
        this.tree = {};
        delete this.selection;
        this.noLimit = noLimit;
        delete this.currentHistoryFile;
        delete this.historyFiles;
        delete this.date;
        this._onDidChangeTreeData.fire();
    }
    more() {
        if (!this.noLimit) {
            this.refresh(true);
        }
    }
    deleteAll() {
        // delete history for current file
        this.controller.deleteHistory(this.currentHistoryFile)
            .then(() => this.refresh());
        // const keys = Object.keys(this.historyFiles);
        // if (keys && keys.length) {
        //     const items = [];
        //     keys.forEach(key => items.push(...this.historyFiles[key].map(item => item.file)));
        //     this.controller.deleteFiles(items)
        //         .then(() => this.refresh());
        // }
    }
    show(file) {
        vscode.commands.executeCommand('vscode.open', file);
    }
    showSide(element) {
        if (element.kind === 2 /* File */)
            vscode.commands.executeCommand('vscode.open', element.file, Math.min(vscode.window.activeTextEditor.viewColumn + 1, 3));
    }
    delete(element) {
        if (element.kind === 2 /* File */)
            this.controller.deleteFile(element.file.fsPath)
                .then(() => this.refresh());
        else if (element.kind === 1 /* Group */) {
            this.controller.deleteFiles(this.historyFiles[element.label].map((value) => value.file))
                .then(() => this.refresh());
        }
    }
    compareToCurrent(element) {
        if (element.kind === 2 /* File */)
            this.controller.compare(element.file, vscode.Uri.file(this.currentHistoryFile));
    }
    select(element) {
        if (element.kind === 2 /* File */) {
            if (this.selection)
                delete this.selection.iconPath;
            this.selection = element;
            this.selection.iconPath = this.selectIconPath;
            this.tree[element.grp].grp.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
            this.redraw();
        }
    }
    compare(element) {
        if (element.kind === 2 /* File */) {
            if (this.selection)
                this.controller.compare(element.file, this.selection.file);
            else
                vscode.window.showErrorMessage('Select a history files to compare with');
        }
    }
}
exports.default = HistoryTreeProvider;
class HistoryItem extends vscode.TreeItem {
    constructor(label = '', file, grp = '') {
        super(label != '' ? label : 'No history', file || !label ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
        this.file = file;
        this.grp = grp;
        this.kind = label ? (file ? 2 /* File */ : 1 /* Group */) : 0 /* None */;
        switch (this.kind) {
            case 2 /* File */:
                this.contextValue = 'localHistoryItem';
                break;
            case 1 /* Group */:
                this.contextValue = 'localHistoryGrp';
                break;
            default:// EHistoryTreeItem.None
                this.contextValue = 'localHistoryNone';
        }
        // this.command = this.kind === EHistoryTreeItem.File ? {
        //     command: 'treeLocalHistory.showEntry',
        //     title: 'Open Local History',
        //     arguments: [file]
        // } : undefined;
        this.command = this.kind === 2 /* File */ ? {
            command: 'treeLocalHistory.compareToCurrentEntry',
            title: 'Compare with current version',
            arguments: [this]
        } : undefined;
    }
}
//# sourceMappingURL=historyTree.provider.js.map