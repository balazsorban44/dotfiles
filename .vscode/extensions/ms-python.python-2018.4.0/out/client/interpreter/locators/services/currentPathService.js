"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const _ = require("lodash");
const path = require("path");
const types_1 = require("../../../common/platform/types");
const types_2 = require("../../../common/process/types");
const types_3 = require("../../../common/types");
const types_4 = require("../../../ioc/types");
const contracts_1 = require("../../contracts");
const types_5 = require("../../virtualEnvs/types");
const cacheableLocatorService_1 = require("./cacheableLocatorService");
let CurrentPathService = class CurrentPathService extends cacheableLocatorService_1.CacheableLocatorService {
    constructor(virtualEnvMgr, versionProvider, processService, serviceContainer) {
        super('CurrentPathService', serviceContainer);
        this.virtualEnvMgr = virtualEnvMgr;
        this.versionProvider = versionProvider;
        this.processService = processService;
        this.fs = serviceContainer.get(types_1.IFileSystem);
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    getInterpretersImplementation(resource) {
        return this.suggestionsFromKnownPaths();
    }
    suggestionsFromKnownPaths(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const configSettings = this.serviceContainer.get(types_3.IConfigurationService).getSettings(resource);
            const currentPythonInterpreter = this.getInterpreter(configSettings.pythonPath, '').then(interpreter => [interpreter]);
            const python = this.getInterpreter('python', '').then(interpreter => [interpreter]);
            const python2 = this.getInterpreter('python2', '').then(interpreter => [interpreter]);
            const python3 = this.getInterpreter('python3', '').then(interpreter => [interpreter]);
            return Promise.all([currentPythonInterpreter, python, python2, python3])
                .then(listOfInterpreters => _.flatten(listOfInterpreters))
                .then(interpreters => interpreters.filter(item => item.length > 0))
                .then(interpreters => Promise.all(interpreters.map(interpreter => this.getInterpreterDetails(interpreter))));
        });
    }
    getInterpreterDetails(interpreter) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([
                this.versionProvider.getVersion(interpreter, path.basename(interpreter)),
                this.virtualEnvMgr.getEnvironmentName(interpreter)
            ]).
                then(([displayName, virtualEnvName]) => {
                displayName += virtualEnvName.length > 0 ? ` (${virtualEnvName})` : '';
                return {
                    displayName,
                    path: interpreter,
                    type: virtualEnvName ? contracts_1.InterpreterType.VirtualEnv : contracts_1.InterpreterType.Unknown
                };
            });
        });
    }
    getInterpreter(pythonPath, defaultValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const output = yield this.processService.exec(pythonPath, ['-c', 'import sys;print(sys.executable)'], {});
                const executablePath = output.stdout.trim();
                if (executablePath.length > 0 && (yield this.fs.fileExistsAsync(executablePath))) {
                    return executablePath;
                }
                return defaultValue;
            }
            catch (_a) {
                return defaultValue; // Ignore exceptions in getting the executable.
            }
        });
    }
};
CurrentPathService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_5.IVirtualEnvironmentManager)),
    __param(1, inversify_1.inject(contracts_1.IInterpreterVersionService)),
    __param(2, inversify_1.inject(types_2.IProcessService)),
    __param(3, inversify_1.inject(types_4.IServiceContainer))
], CurrentPathService);
exports.CurrentPathService = CurrentPathService;
//# sourceMappingURL=currentPathService.js.map