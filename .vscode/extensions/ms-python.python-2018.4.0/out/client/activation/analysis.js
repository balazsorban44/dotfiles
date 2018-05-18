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
const path = require("path");
const vscode_languageclient_1 = require("vscode-languageclient");
const types_1 = require("../common/application/types");
const constants_1 = require("../common/constants");
const helpers_1 = require("../common/helpers");
const types_2 = require("../common/platform/types");
const types_3 = require("../common/process/types");
const stopWatch_1 = require("../common/stopWatch");
const types_4 = require("../common/types");
const types_5 = require("../common/variables/types");
const constants_2 = require("../telemetry/constants");
const telemetry_1 = require("../telemetry/telemetry");
const downloader_1 = require("./downloader");
const interpreterDataService_1 = require("./interpreterDataService");
const platformData_1 = require("./platformData");
const PYTHON = 'python';
const dotNetCommand = 'dotnet';
const languageClientName = 'Python Tools';
const analysisEngineFolder = 'analysis';
class LanguageServerStartupErrorHandler {
    constructor(deferred) {
        this.deferred = deferred;
    }
    error(error, message, count) {
        this.deferred.reject(error);
        return vscode_languageclient_1.ErrorAction.Shutdown;
    }
    closed() {
        this.deferred.reject();
        return vscode_languageclient_1.CloseAction.DoNotRestart;
    }
}
class AnalysisExtensionActivator {
    constructor(services, pythonSettings) {
        this.services = services;
        this.sw = new stopWatch_1.StopWatch();
        this.configuration = this.services.get(types_4.IConfigurationService);
        this.appShell = this.services.get(types_1.IApplicationShell);
        this.output = this.services.get(types_4.IOutputChannel, constants_1.STANDARD_OUTPUT_CHANNEL);
        this.fs = this.services.get(types_2.IFileSystem);
        this.platformData = new platformData_1.PlatformData(services.get(types_2.IPlatformService), this.fs);
    }
    activate(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientOptions = yield this.getAnalysisOptions(context);
            if (!clientOptions) {
                return false;
            }
            return this.startLanguageServer(context, clientOptions);
        });
    }
    deactivate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.languageClient) {
                yield this.languageClient.stop();
            }
        });
    }
    startLanguageServer(context, clientOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            // Determine if we are running MSIL/Universal via dotnet or self-contained app.
            const mscorlib = path.join(context.extensionPath, analysisEngineFolder, 'mscorlib.dll');
            let downloadPackage = false;
            const reporter = telemetry_1.getTelemetryReporter();
            reporter.sendTelemetryEvent(constants_2.PYTHON_ANALYSIS_ENGINE_ENABLED);
            if (!(yield this.fs.fileExistsAsync(mscorlib))) {
                // Depends on .NET Runtime or SDK
                this.languageClient = this.createSimpleLanguageClient(context, clientOptions);
                try {
                    yield this.tryStartLanguageClient(context, this.languageClient);
                    return true;
                }
                catch (ex) {
                    if (yield this.isDotNetInstalled()) {
                        this.appShell.showErrorMessage(`.NET Runtime appears to be installed but the language server did not start. Error ${ex}`);
                        reporter.sendTelemetryEvent(constants_2.PYTHON_ANALYSIS_ENGINE_ERROR, { error: 'Failed to start (MSIL)' });
                        return false;
                    }
                    // No .NET Runtime, no mscorlib - need to download self-contained package.
                    downloadPackage = true;
                }
            }
            if (downloadPackage) {
                const downloader = new downloader_1.AnalysisEngineDownloader(this.services, analysisEngineFolder);
                yield downloader.downloadAnalysisEngine(context);
                reporter.sendTelemetryEvent(constants_2.PYTHON_ANALYSIS_ENGINE_DOWNLOADED);
            }
            const serverModule = path.join(context.extensionPath, analysisEngineFolder, this.platformData.getEngineExecutableName());
            // Now try to start self-contained app
            this.languageClient = this.createSelfContainedLanguageClient(context, serverModule, clientOptions);
            try {
                yield this.tryStartLanguageClient(context, this.languageClient);
                return true;
            }
            catch (ex) {
                this.appShell.showErrorMessage(`Language server failed to start. Error ${ex}`);
                reporter.sendTelemetryEvent(constants_2.PYTHON_ANALYSIS_ENGINE_ERROR, { error: 'Failed to start (platform)' });
                return false;
            }
        });
    }
    tryStartLanguageClient(context, lc) {
        return __awaiter(this, void 0, void 0, function* () {
            let disposable;
            const deferred = helpers_1.createDeferred();
            try {
                const sw = new stopWatch_1.StopWatch();
                lc.clientOptions.errorHandler = new LanguageServerStartupErrorHandler(deferred);
                disposable = lc.start();
                lc.onReady()
                    .then(() => deferred.resolve())
                    .catch(deferred.reject);
                yield deferred.promise;
                this.output.appendLine(`Language server ready: ${this.sw.elapsedTime} ms`);
                context.subscriptions.push(disposable);
                const reporter = telemetry_1.getTelemetryReporter();
                reporter.sendTelemetryEvent(constants_2.PYTHON_ANALYSIS_ENGINE_STARTUP, {}, { startup_time: sw.elapsedTime });
            }
            catch (ex) {
                if (disposable) {
                    disposable.dispose();
                }
                throw ex;
            }
        });
    }
    createSimpleLanguageClient(context, clientOptions) {
        const commandOptions = { stdio: 'pipe' };
        const serverModule = path.join(context.extensionPath, analysisEngineFolder, this.platformData.getEngineDllName());
        const serverOptions = {
            run: { command: dotNetCommand, args: [serverModule], options: commandOptions },
            debug: { command: dotNetCommand, args: [serverModule, '--debug'], options: commandOptions }
        };
        return new vscode_languageclient_1.LanguageClient(PYTHON, languageClientName, serverOptions, clientOptions);
    }
    createSelfContainedLanguageClient(context, serverModule, clientOptions) {
        const options = { stdio: 'pipe' };
        const serverOptions = {
            run: { command: serverModule, rgs: [], options: options },
            debug: { command: serverModule, args: ['--debug'], options }
        };
        return new vscode_languageclient_1.LanguageClient(PYTHON, languageClientName, serverOptions, clientOptions);
    }
    getAnalysisOptions(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // tslint:disable-next-line:no-any
            const properties = new Map();
            // Microsoft Python code analysis engine needs full path to the interpreter
            const interpreterDataService = new interpreterDataService_1.InterpreterDataService(context, this.services);
            const interpreterData = yield interpreterDataService.getInterpreterData();
            if (!interpreterData) {
                const appShell = this.services.get(types_1.IApplicationShell);
                appShell.showErrorMessage('Unable to determine path to Python interpreter.');
                return;
            }
            // tslint:disable-next-line:no-string-literal
            properties['InterpreterPath'] = interpreterData.path;
            // tslint:disable-next-line:no-string-literal
            properties['Version'] = interpreterData.version;
            // tslint:disable-next-line:no-string-literal
            properties['PrefixPath'] = interpreterData.prefix;
            // tslint:disable-next-line:no-string-literal
            properties['DatabasePath'] = path.join(context.extensionPath, analysisEngineFolder);
            let searchPaths = interpreterData.searchPaths;
            const settings = this.configuration.getSettings();
            if (settings.autoComplete) {
                const extraPaths = settings.autoComplete.extraPaths;
                if (extraPaths && extraPaths.length > 0) {
                    searchPaths = `${searchPaths};${extraPaths.join(';')}`;
                }
            }
            const envProvider = this.services.get(types_5.IEnvironmentVariablesProvider);
            const pythonPath = (yield envProvider.getEnvironmentVariables()).PYTHONPATH;
            // tslint:disable-next-line:no-string-literal
            properties['SearchPaths'] = `${searchPaths};${pythonPath ? pythonPath : ''}`;
            const selector = [PYTHON];
            // Options to control the language client
            return {
                // Register the server for Python documents
                documentSelector: selector,
                synchronize: {
                    configurationSection: PYTHON
                },
                outputChannel: this.output,
                initializationOptions: {
                    interpreter: {
                        properties
                    },
                    displayOptions: {
                        trimDocumentationLines: false,
                        maxDocumentationLineLength: 0,
                        trimDocumentationText: false,
                        maxDocumentationTextLength: 0
                    },
                    asyncStartup: true,
                    testEnvironment: constants_1.isTestExecution()
                }
            };
        });
    }
    isDotNetInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            const ps = this.services.get(types_3.IProcessService);
            const result = yield ps.exec('dotnet', ['--version']).catch(() => { return { stdout: '' }; });
            return result.stdout.trim().startsWith('2.');
        });
    }
}
exports.AnalysisExtensionActivator = AnalysisExtensionActivator;
//# sourceMappingURL=analysis.js.map