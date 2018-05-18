"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const constants_1 = require("../common/constants");
const types_1 = require("../common/types");
const contracts_1 = require("../interpreter/contracts");
const jediProxyFactory_1 = require("../languageServices/jediProxyFactory");
const completionProvider_1 = require("../providers/completionProvider");
const definitionProvider_1 = require("../providers/definitionProvider");
const hoverProvider_1 = require("../providers/hoverProvider");
const objectDefinitionProvider_1 = require("../providers/objectDefinitionProvider");
const referenceProvider_1 = require("../providers/referenceProvider");
const renameProvider_1 = require("../providers/renameProvider");
const signatureProvider_1 = require("../providers/signatureProvider");
const simpleRefactorProvider_1 = require("../providers/simpleRefactorProvider");
const symbolProvider_1 = require("../providers/symbolProvider");
const constants_2 = require("../unittests/common/constants");
const tests = require("../unittests/main");
class ClassicExtensionActivator {
    constructor(serviceManager, pythonSettings, documentSelector) {
        this.serviceManager = serviceManager;
        this.pythonSettings = pythonSettings;
        this.documentSelector = documentSelector;
    }
    activate(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const standardOutputChannel = this.serviceManager.get(types_1.IOutputChannel, constants_1.STANDARD_OUTPUT_CHANNEL);
            simpleRefactorProvider_1.activateSimplePythonRefactorProvider(context, standardOutputChannel, this.serviceManager);
            const jediFactory = new jediProxyFactory_1.JediFactory(context.asAbsolutePath('.'), this.serviceManager);
            context.subscriptions.push(jediFactory);
            context.subscriptions.push(...objectDefinitionProvider_1.activateGoToObjectDefinitionProvider(jediFactory));
            context.subscriptions.push(jediFactory);
            context.subscriptions.push(vscode_1.languages.registerRenameProvider(this.documentSelector, new renameProvider_1.PythonRenameProvider(this.serviceManager)));
            const definitionProvider = new definitionProvider_1.PythonDefinitionProvider(jediFactory);
            context.subscriptions.push(vscode_1.languages.registerDefinitionProvider(this.documentSelector, definitionProvider));
            context.subscriptions.push(vscode_1.languages.registerHoverProvider(this.documentSelector, new hoverProvider_1.PythonHoverProvider(jediFactory)));
            context.subscriptions.push(vscode_1.languages.registerReferenceProvider(this.documentSelector, new referenceProvider_1.PythonReferenceProvider(jediFactory)));
            context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider(this.documentSelector, new completionProvider_1.PythonCompletionItemProvider(jediFactory, this.serviceManager), '.'));
            context.subscriptions.push(vscode_1.languages.registerCodeLensProvider(this.documentSelector, this.serviceManager.get(contracts_1.IShebangCodeLensProvider)));
            const symbolProvider = new symbolProvider_1.PythonSymbolProvider(jediFactory);
            context.subscriptions.push(vscode_1.languages.registerDocumentSymbolProvider(this.documentSelector, symbolProvider));
            if (this.pythonSettings.devOptions.indexOf('DISABLE_SIGNATURE') === -1) {
                context.subscriptions.push(vscode_1.languages.registerSignatureHelpProvider(this.documentSelector, new signatureProvider_1.PythonSignatureProvider(jediFactory), '(', ','));
            }
            const unitTestOutChannel = this.serviceManager.get(types_1.IOutputChannel, constants_2.TEST_OUTPUT_CHANNEL);
            tests.activate(context, unitTestOutChannel, symbolProvider, this.serviceManager);
            return true;
        });
    }
    // tslint:disable-next-line:no-empty
    deactivate() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.ClassicExtensionActivator = ClassicExtensionActivator;
//# sourceMappingURL=classic.js.map